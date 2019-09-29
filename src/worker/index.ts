import { join, basename, parse, extname } from 'path';
import * as fs from 'fs';

import { FFMpegStatus, default as ffmpeg } from '@src/utils/ffmpeg';
import { ffprobe, FFProbe } from '@src/utils/ffprobe';
import { ARCHIVE_PATH } from '@src/config';
import { send } from '@src/utils/socket';
import { Encode } from '@src/entity';
import { musicEncodeDone } from '@src/api';

let isWorking = false;

export function workNotDone() {
  if (isWorking) {
    return;
  }
  console.log('Start Working');
  isWorking = true;
  
  (async () => {
    while(true) {
      const encodes: Encode[] = await Encode.findNotDone();
      
      if (encodes.length === 0) {
        console.log('Finish Working');
        isWorking = false;
        return;
      }
      
      await work(encodes[0]);
    }
  })().catch(console.error);
}

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

  let beforeProgress = 0;
  let beforeTime = Date.now();
  await ffmpeg(newArgs, (status: FFMpegStatus) => {
    const nowProgress: number = parseFloat((status.time / probed.duration * 100).toFixed(2));
    const nowTime = Date.now();
    
    const speed = (nowProgress - beforeProgress) / (nowTime - beforeTime);
    const remainRaw = (100 - nowProgress) / (speed * 1000)
    const remain = parseFloat(remainRaw.toFixed(1));
    
    console.log(
      `[${new Date().toLocaleString()}]`,
      `"${basename(encode.inpath)}"`,
      `${nowProgress}%`,
      `${remain}s`,
      `${status.speed}x`
    );
    
    Encode.updateProgress(encode.encodeId, nowProgress);
    
    send(encode.encodeId, nowProgress, remain, status.speed);
    
    beforeProgress = nowProgress;
    beforeTime = nowTime;
  })

  if(encode.inpath === encode.outpath) {
    fs.unlinkSync(realInPath);
    fs.renameSync(realOutPath, realInPath);
  }
  
  // TODO 멋있게
  if (extname(outpath) === '.mp3') {
    await musicEncodeDone(outpath, probed.duration);
  }
}