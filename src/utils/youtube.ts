import { spawn } from 'child_process';

import { DOWNLOAD_FOLDER, ARCHIVE_PATH } from '@src/config';

export interface YoutubeStatus {
  progress: number;
  total: number;
  speed: number;
  eta: number;
}

export function download(url: string, isMusic: boolean, callback: (status: YoutubeStatus) => void): Promise<string | null> {
  return new Promise((resolve, reject) => {
    let path: string | null = null;
    
    const format = isMusic ? 'bestaudio' : 'bestvideo[height<=720]'
    
    // youtube-dl -f bestaudio --no-playlist --no-continue -o '/archive/Musics/download/%(title)s.%(ext)s'
    const options = [
      '-f', format,
      '--no-playlist',
      '--no-continue',
      '-o', `${DOWNLOAD_FOLDER}/%(title)s.%(ext)s`,
      url,
    ]
    
    const ffmpeg = spawn('youtube-dl', options);
    
    ffmpeg.stdout.on('data', (data) => {
      const str = data.toString().trim();
      
      const tmp = extractPath(str);
      if (tmp) {
        path = tmp;
      }
      
      const status = extractStatus(str);
      if (status) {
        callback(status);
      }
    });

    ffmpeg.stderr.on('data', (data) => {
      const str = data.toString().trim();
      console.error(str);
    });

    ffmpeg.on('close', () => {
      resolve(path);
    });
  })
}

function extractPath(str: string): string | null {
  if (str.search(/Destination: .*/) >= 0) {
    return str.match(/Destination: .*/)[0].replace('Destination: ', '');
  }
  return null;
}

function extractStatus(str: string): YoutubeStatus | null {
  const tmp: YoutubeStatus = {
    progress: -1,
    total: -1,
    speed: -1,
    eta: -1,
  }
  
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
  } else {
    return null;
  }
}