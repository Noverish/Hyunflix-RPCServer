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
      // const status = extract(data.toString());
      // if (status) {
      //   callback(status);
      // }
    });

    ffmpeg.stderr.on('data', (data) => {
      const status = extract(data.toString());
      if (status) {
        callback(status);
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
    const frameMatched = data.match(/frame=[ \d]*/);
    const fpsMatched = data.match(/fps=[ \d]*/);
    const qMatched = data.match(/q=[ .-\d]*/);
    const sizeMatched = data.match(/size=[ \d]*kB/);
    const timeMatched = data.match(/time=[:.\d]*/)[0];
    const bitrateMatched = data.match(/bitrate=[.\d]*kbits\/s/)[0];
    const speedMatched = data.match(/speed=[.\d]*x/)[0];

    const frameString = frameMatched[0].match(/[\d]+/)[0];
    const fpsString = fpsMatched[0].match(/[\d]+/)[0];
    const qString = qMatched[0].match(/[.-\d]+/)[0];
    const sizeString = sizeMatched[0].match(/[.\d]+/)[0];
    const timeString = timeMatched.match(/[:.\d]+/)[0];
    const bitrateString = bitrateMatched.match(/[.\d]+/)[0];
    const speedString = speedMatched.match(/[.\d]+/)[0];

    return {
      frame: parseInt(frameString),
      fps: parseInt(fpsString),
      q: parseFloat(qString),
      size: parseInt(sizeString),
      time: timeString,
      bitrate: parseFloat(bitrateString),
      speed: parseFloat(speedString),
    };
  } catch (err) {
    return null;
  }
}
