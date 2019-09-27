import { spawn } from 'child_process';

export interface FFMpegStatus {
  frame: number;
  fps: number;
  q: number;
  size: number;
  time: string;
  bitrate: number;
  speed: number;
}

export default function (args: string[], callback: (FFMpegStatus) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args);
    
    ffmpeg.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    ffmpeg.stderr.on('data', (data) => {
      const status = extract(data.toString());
      if (status) {
        callback(status);
      } else {
        console.log(data.toString());
      }
    });

    ffmpeg.on('close', () => {
      resolve();
    });
  });
}

function extract(data: string): FFMpegStatus | null {
  if (data.split('\n').length !== 1) {
    return null;
  }
  
  try {
    const frameMatched = data.match(/frame=[ .-\d]*/)[0];
    const fpsMatched = data.match(/fps=[ .-\d]*/)[0];
    const qMatched = data.match(/q=[ .-\d]*/)[0];
    const sizeMatched = data.match(/size=[ .-\d]*kB/)[0];
    const timeMatched = data.match(/time=[ .:\d]*/)[0];
    const bitrateMatched = data.match(/bitrate=[ .-\d]*kbits\/s/)[0];
    const speedMatched = data.match(/speed=[ .-\d]*x/)[0];

    const frameString = frameMatched.match(/[.-\d]+/)[0];
    const fpsString = fpsMatched.match(/[.-\d]+/)[0];
    const qString = qMatched.match(/[.-\d]+/)[0];
    const sizeString = sizeMatched.match(/[.-\d]+/)[0];
    const timeString = timeMatched.match(/[.:\d]+/)[0];
    const bitrateString = bitrateMatched.match(/[.-\d]+/)[0];
    const speedString = speedMatched.match(/[.-\d]+/)[0];

    return {
      frame: parseFloat(frameString),
      fps: parseFloat(fpsString),
      q: parseFloat(qString),
      size: parseFloat(sizeString),
      time: timeString,
      bitrate: parseFloat(bitrateString),
      speed: parseFloat(speedString),
    };
  } catch (err) {
    return null;
  }
}
