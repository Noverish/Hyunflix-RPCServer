import { spawn } from 'child_process';

import { YoutubeStatus, YoutubeInfo } from '@src/models';
import { ARCHIVE_PATH, DOWNLOAD_FOLDER } from '@src/config';
import { exec } from '@src/utils';

export async function getYoutubePlaylist(url: string): Promise<YoutubeInfo[]> {
  return (await exec(`youtube-dl -j --flat-playlist ${url}`))
    .split('\n')
    .map((line: string) => {
      const info = JSON.parse(line);
      return { id: info.id, title: info.title };
    });
}

export function downloadYoutube(url: string, callback: (status: YoutubeStatus) => void): Promise<string | null> {
  return new Promise((resolve, reject) => {
    let path: string | null = null;
    let stdouts = '';

    // youtube-dl -f bestaudio --no-playlist --no-continue -o '/archive/Musics/download/%(title)s.%(ext)s'
    const options = [
      '-f', 'bestaudio',
      '--no-playlist',
      '--no-continue',
      '-o', `${DOWNLOAD_FOLDER}/%(title)s.%(ext)s`,
      url,
    ];

    const ffmpeg = spawn('youtube-dl', options);

    ffmpeg.stdout.on('data', (data) => {
      const str = data.toString();
      const tmpPath = extractPath(str);
      const status = extractStatus(str);

      if (tmpPath) {
        path = tmpPath;
      } else if (status) {
        callback(status);
      } else {
        stdouts += str;
      }
    });

    ffmpeg.stderr.on('data', (data) => {
      stdouts += data.toString();
    });

    ffmpeg.on('exit', (code: number) => {
      if (code === 0) {
        resolve(path);
      } else {
        reject(new Error(stdouts));
      }
    });
  });
}

function extractPath(str: string): string | null {
  if (str.search(/Destination: .*/) >= 0) {
    return str.match(/Destination: .*/)[0].replace('Destination: ', '').replace(ARCHIVE_PATH, '');
  }
  return null;
}

function extractStatus(str: string): YoutubeStatus | null {
  const tmp: YoutubeStatus = {
    progress: -1,
    total: -1,
    speed: -1,
    eta: -1,
  };

  const progressMatches = str.match(/[.\d]*%/);
  if (progressMatches) {
    tmp.progress = parseFloat(progressMatches[0].replace(/[^.\d]/g, ''));
  }

  const totalMatches = str.match(/of [.\d]*MiB/);
  if (totalMatches) {
    tmp.total = parseFloat(totalMatches[0].replace(/[^.\d]/g, ''));
  }

  const speedMatches = str.match(/[.\d]*MiB\/s/);
  if (speedMatches) {
    tmp.speed = parseFloat(speedMatches[0].replace(/[^.\d]/g, ''));
  }

  const etaMatches = str.match(/ETA [\d]{2}:[\d]{2}/);
  if (etaMatches && etaMatches[0].split(':').length === 2) {
    const min = parseInt(etaMatches[0].split(':')[0].replace(/[^.\d]/g, ''));
    const sec = parseInt(etaMatches[0].split(':')[1].replace(/[^.\d]/g, ''));
    tmp.eta = min * 60 + sec;
  }

  const keys = Object.keys(tmp);
  if (keys.every(k => tmp[k] >= 0)) {
    return tmp;
  }
  return null;
}
