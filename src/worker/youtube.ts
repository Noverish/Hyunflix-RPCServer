import { extname, basename } from 'path';
import { promises as fsPromises } from 'fs';
import { parse as urlParse } from 'url';
import { parse as queryParse } from 'querystring';

import { addMusic } from '@src/api';
import { logger } from '@src/utils';
import { download, YoutubeStatus } from '@src/utils/youtube';
import { FFProbe, ffprobe } from '@src/utils/ffprobe';
import { FFMpegStatus, ffmpeg } from '@src/utils/ffmpeg';

export default async function (url: string, tags: string[], music: boolean, video: boolean) {
  logger(`[Youtube Start] ${url}, music: ${music}, video: ${video}`);
  
  if (music) {
    const path: string | null = await download(url, true, (status: YoutubeStatus) => {
      logger(`[Youtube Download] ${status.progress}% ${status.total}MiB ${status.speed}MiB/s ${status.eta}s`);
    })
    
    const inpath = path;
    const outpath = inpath.replace(extname(inpath), '.mp3');
    const args = ['-i', inpath, '-y', outpath];
    const musicName = basename(inpath, extname(inpath));
    
    const { duration }: FFProbe = await ffprobe(inpath);
    
    await ffmpeg(args, duration, (status: FFMpegStatus) => {
      const { progress, eta, speed } = status;
      logger(`[Youtube Encode] "${musicName}" ${progress}% ${eta}s ${speed}x`);
    })
  
    await fsPromises.unlink(inpath);
    
    const title = musicName;
    const youtube = queryParse(urlParse(url).query)['v'].toString();
    
    await addMusic(title, path, duration, youtube, tags, []);
    
    logger(`[Youtube Finish] ${url} => ${path}`);
  }
}
