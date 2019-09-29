import { join, basename, parse } from 'path';
import * as fs from 'fs';

import { FFMpegStatus, default as ffmpeg } from '@src/utils/ffmpeg';
import { ffprobe, FFProbe } from '@src/utils/ffprobe';
import { ARCHIVE_PATH } from '@src/config';
import { send } from '@src/utils/socket';
import { Encode } from '@src/entity';

export async function work(encode: Encode) {
  const args: string[] = encode.options.split(' ');
  const inpath: string = encode.inpath;
  const outpath: string = (inpath === encode.outpath)
    ? parse(inpath).dir + '/' + parse(inpath).name + '.tmp.mp4'
    : encode.outpath;
     
  const realInPath = join(ARCHIVE_PATH, inpath);
  const realOutPath = (outpath === '/dev/null') ? outpath : join(ARCHIVE_PATH, outpath);
  
  const probed: FFProbe = await ffprobe(realInPath);
  
  const newArgs = ['-i', realInPath, ...args, realOutPath].filter(v => !!v);
  
  console.log(`[${new Date().toLocaleString()}]`, 'ffmpeg ' + newArgs.join(' '));

  await ffmpeg(newArgs, (status: FFMpegStatus) => {
    // TODO const remain: number = Math.floor((probed.frame - status.frame) / status.fps);
    const remain = 0;
    const progress: number = parseFloat((status.time / probed.duration * 100).toFixed(2));
    
    console.log(
      `[${new Date().toLocaleString()}]`,
      `"${basename(encode.inpath)}"`,
      `${progress}%`,
      `${remain}s`,
      `${status.speed}x`
    );
    
    Encode.updateProgress(encode.encodeId, progress);
    
    send(encode.encodeId, progress, remain, status.speed);
  })

  // TODO Encode.updateProgress(queued.encodeId, 100);
  
  if(encode.inpath === encode.outpath) {
    fs.unlinkSync(realInPath);
    fs.renameSync(realOutPath, realInPath);
  }
}

let isWorking = false;

export function workNotDone() {
  if (isWorking) {
    return;
  }
  isWorking = true;
  
  (async () => {
    while(true) {
      const encodes: Encode[] = await Encode.findNotDone();
      
      if (encodes.length === 0) {
        isWorking = false;
        return;
      }
      
      await work(encodes[0]);
    }
  })().catch(console.error);
}