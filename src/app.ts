import { join, basename, parse } from 'path';
import { createConnection } from 'typeorm';
import * as fs from 'fs';

import { FFMpegStatus, default as ffmpeg } from '@src/utils/ffmpeg';
import { ffprobeVideo, FFProbeVideo } from '@src/utils/ffprobe';
import { POOL_INTERVAL, ARCHIVE_PATH } from '@src/config';
import { send } from '@src/server/socket';
import { Encode } from '@src/entity';

async function encodeIfExists() {
  const queuedList: Encode[] = await Encode.findNotDone();

  if (queuedList.length > 0) {
    const queued = queuedList[0];
    
    const args: string[] = queued.options.split(' ');
    const inpath: string = queued.inpath;
    const outpath: string = (inpath === queued.outpath)
      ? parse(inpath).dir + '/' + parse(inpath).name + '.tmp.mp4'
      : queued.outpath;
      
    const realInPath = join(ARCHIVE_PATH, inpath);
    const realOutPath = (outpath === '/dev/null') ? outpath : join(ARCHIVE_PATH, outpath);
    
    const probed: FFProbeVideo = await ffprobeVideo(realInPath);
    
    const newArgs = ['-i', realInPath, ...args, realOutPath];
    
    console.log(`[${new Date().toLocaleString()}]`, 'ffmpeg ' + newArgs.join(' '));

    await ffmpeg(newArgs, (status: FFMpegStatus) => {
      const remain: number = Math.floor((probed.frame - status.frame) / status.fps);
      const progress: number = parseFloat((status.frame / probed.frame * 100).toFixed(2));
      
      console.log(
        `[${new Date().toLocaleString()}]`,
        `"${basename(queued.inpath)}"`,
        `${progress}%`,
        `${remain}s`,
        `${status.speed}x`
      );
      
      Encode.updateProgress(queued.encodeId, progress);
      
      send(queued.encodeId, progress, remain, status.speed);
    })

    Encode.updateProgress(queued.encodeId, 100);
    
    if(queued.inpath === queued.outpath) {
      fs.unlinkSync(realInPath);
      fs.renameSync(realOutPath, realInPath);
    }
  }
  
  setTimeout(encodeIfExists, POOL_INTERVAL);
}

async function main() {
  await createConnection();
  
  setTimeout(encodeIfExists, POOL_INTERVAL);
}

main().catch(err => {
  console.error(err);
})

