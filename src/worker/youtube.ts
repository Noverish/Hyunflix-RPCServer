import { extname, basename } from 'path';
import { promises as fsPromises } from 'fs';
import { parse as urlParse } from 'url';
import { parse as queryParse } from 'querystring';

import { YOUTUBE_SOCKET_PATH } from '@src/config';
import { addMusic } from '@src/api';
import { logger } from '@src/utils';
import { download, YoutubeStatus } from '@src/utils/youtube';
import { FFProbe, ffprobe } from '@src/utils/ffprobe';
import { FFMpegStatus, ffmpeg } from '@src/utils/ffmpeg';
import { send } from '@src/utils/socket';
import { YoutubeStage } from '@src/models';

export default async function (url: string, tags: string[], music: boolean, video: boolean) {
  logger(`[Youtube Start] ${url}, music: ${music}, video: ${video}`);
  send(YOUTUBE_SOCKET_PATH, {
    stage: YoutubeStage.ready,
    progress: 0,
    eta: 0,
  });
  
  if (music) {
    const path: string | null = await download(url, true, (status: YoutubeStatus) => {
      logger(`[Youtube Download] ${status.progress}% ${status.total}MiB ${status.speed}MiB/s ${status.eta}s`);
      send(YOUTUBE_SOCKET_PATH, {
        stage: YoutubeStage.download,
        progress: status.progress,
        eta: status.eta,
      });
    })
    
    const inpath = path;
    const outpath = inpath.replace(extname(inpath), '.mp3');
    const args = ['-i', inpath, '-y', outpath];
    const musicName = basename(inpath, extname(inpath));
    
    const { duration }: FFProbe = await ffprobe(inpath);
    
    await ffmpeg(args, duration, (status: FFMpegStatus) => {
      const { progress, eta, speed } = status;
      logger(`[Youtube Encode] "${musicName}" ${progress}% ${eta}s ${speed}x`);
      send(YOUTUBE_SOCKET_PATH, {
        stage: YoutubeStage.encode,
        progress: status.progress,
        eta: status.eta,
      });
    })
  
    await fsPromises.unlink(inpath);
    
    const title = musicName;
    const youtube = queryParse(urlParse(url).query)['v'].toString();
    
    await addMusic(title, path, duration, youtube, tags, []);
    
    logger(`[Youtube Finish] ${url} => ${outpath}`);
    send(YOUTUBE_SOCKET_PATH, {
      stage: YoutubeStage.success,
      progress: 100,
      eta: 0,
    });
  }
}
