import { join, basename, parse, extname } from 'path';
import * as fs from 'fs';

import { FFMpegStatus, ffmpeg } from '@src/utils/ffmpeg';
import { ffprobe, FFProbe } from '@src/utils/ffprobe';
import { ARCHIVE_PATH, FFMPEG_SOCKET_PATH } from '@src/config';
import { send } from '@src/utils/socket';
import { Encode } from '@src/entity';
import { logger } from '@src/utils';

let isWorking = false;

export function workNotDone() {
  if (isWorking) {
    return;
  }
  logger('[FFMpeg Working Start]');
  isWorking = true;
  
  (async () => {
    while(true) {
      const encode: Encode | null = await Encode.findNotDone();
      
      if (encode) {
        await work(encode);
      } else {
        logger('[FFMpeg Working Finish]');
        isWorking = false;
        return;
      }
    }
  })().catch(console.error);
}

async function work(encode: Encode) {
  const args: string[] = encode.options.split(' ');
  const inpath: string = encode.inpath;
  const outpath: string = (inpath === encode.outpath)
    ? parse(inpath).dir + '/' + parse(inpath).name + '.tmp.mp4'
    : encode.outpath;
     
  const realInPath = join(ARCHIVE_PATH, inpath);
  const realOutPath = (outpath === '/dev/null') ? outpath : join(ARCHIVE_PATH, outpath);
  const newArgs = ['-i', realInPath, ...args, realOutPath].filter(v => !!v);
  const fileName = basename(inpath, extname(inpath));
  
  logger(`[FFMpeg Start] ${newArgs.join(' ')}`);
  
  const probed: FFProbe = await ffprobe(realInPath);
  
  try {
    await ffmpeg(newArgs, probed.duration, (status: FFMpegStatus) => {
      const { progress, eta, speed } = status;
      logger(`[FFMpeg Encode] "${fileName}" ${progress}% ${eta}s ${speed}x`);
      
      Encode.updateProgress(encode.id, progress);
      
      send(FFMPEG_SOCKET_PATH, {
        progress,
        eta,
        speed: status.speed,
        encodeId: encode.id,
      });
    })
    
    if(encode.inpath === encode.outpath) {
      fs.unlinkSync(realInPath);
      fs.renameSync(realOutPath, realInPath);
    }
    
    logger(`[FFMpeg Finish] ${newArgs.join(' ')}`);
  } catch (err) {
    await Encode.updateProgress(encode.id, -1);
    
    send(FFMPEG_SOCKET_PATH, {
      progress: -1,
      eta: 0,
      speed: 0,
      encodeId: encode.id,
    });
    
    logger(`[FFMpeg Failed] ${newArgs.join(' ')}`);
    logger(`[FFMpeg Failed] ${err.message}`);
  }
}