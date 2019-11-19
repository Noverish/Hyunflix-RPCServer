import { createConnection, Between } from 'typeorm';
import { parse } from 'path';

import { Encode } from '@src/entity/Encode';
import { ffprobeVideo } from '@src/functions/ffprobe';
import { ffmpeg } from '@src/functions/ffmpeg';
import { unlink, rename } from '@src/functions/fs';
import { FFMpegStatus, EncodeStatus } from '@src/models';
import { sleep } from '@src/utils';
import { send as sendSSE } from '@src/sse';

function send(status: EncodeStatus) {
  sendSSE('/ffmpeg', status);
}

export default async function () {
  await createConnection();
  
  while (true) {
    const encode: Encode | undefined = await Encode.findOne({ progress: Between(0, 99) });
    if (encode) {
      await encodeVideo(encode);
    } else {
      await sleep(1000);
    }
  }
}

async function encodeVideo(encode: Encode) {
  try {
    const args: string[] = encode.options.split(' ');
    const inpath: string = encode.inpath;
    const outpath: string = (inpath === encode.outpath)
      ? `${parse(inpath).dir}/${parse(inpath).name}.tmp.mp4`
      : encode.outpath;
  
    const newArgs = ['-i', inpath, ...args, outpath].filter(v => !!v);
    
    const { duration } = await ffprobeVideo(inpath);
    
    await ffmpeg(newArgs, (status: FFMpegStatus) => {
      const progress = parseFloat((status.time / duration * 100).toFixed(2));
      const etaRaw = (duration - status.time) / status.speed;
      const eta = parseFloat(etaRaw.toFixed(1));

      Encode.update(encode.id, { progress });

      send({ eta, progress, speed: status.speed, encodeId: encode.id });
    });

    if (encode.inpath === encode.outpath) {
      await unlink(inpath);
      await rename(outpath, inpath);
    }
  } catch (err) {
    Encode.update(encode.id, { progress: -1 });
    console.error(err.message);

    send({ eta: 0, progress: -1, speed: 0, encodeId: encode.id });
  }
}
