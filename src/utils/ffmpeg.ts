import { spawn } from 'child_process';

export interface FFMpegStatus {
  frame: number;
  fps: number;
  q: number;
  size: number;
  time: number;
  bitrate: number;
  speed: number;
  eta: number;
  progress: number;
}

export function ffmpeg(args: string[], duration: number, callback: (FFMpegStatus) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args);
    
    ffmpeg.stdout.on('data', (data) => {
      // console.log(data.toString());
    });

    let beforeProgress = 0;
    let beforeTime = Date.now();
    ffmpeg.stderr.on('data', (data) => {
      const status = extract(data.toString());
      
      if (status) {
        const nowProgress: number = parseFloat((status.time / duration * 100).toFixed(2));
        const nowTime = Date.now();
        
        const progressPerMillis = (nowProgress - beforeProgress) / (nowTime - beforeTime);
        const remainRaw = (100 - nowProgress) / (progressPerMillis * 1000)
        const eta = parseFloat(remainRaw.toFixed(1));
        
        status.progress = nowProgress;
        status.eta = eta;
        callback(status);
      } else {
        // console.log(data.toString());
      }
    });

    ffmpeg.on('close', () => {
      resolve();
    });
  });
}

function extract(data: string): FFMpegStatus | null {
  const tmp: FFMpegStatus = {
    frame: extractFrame(data),
    fps: extractFPS(data),
    q: extractQ(data),
    size: extractSize(data),
    time: extractTime(data),
    bitrate: extractBitrate(data),
    speed: extractSpeed(data),
    eta: -1,
    progress: -1,
  };
  
  const values = Object.keys(tmp).map(k => tmp[k]);
  
  if (values.every(v => v === -1)) {
    return null;
  }
  
  return tmp;
}

function extractFrame(str: string): number {
  try {
    const frameMatched = str.match(/frame=[ .-\d]*/)[0];
    const frameString = frameMatched.match(/[.-\d]+/)[0];
    return parseFloat(frameString);
  } catch (err) {
    return -1;
  }
}

function extractFPS(str: string): number {
  try {
    const fpsMatched = str.match(/fps=[ .-\d]*/)[0];
    const fpsString = fpsMatched.match(/[.-\d]+/)[0];
    return parseFloat(fpsString);
  } catch (err) {
    return -1;
  }
}

function extractQ(str: string): number {
  try {
    const qMatched = str.match(/q=[ .-\d]*/)[0];
    const qString = qMatched.match(/[.-\d]+/)[0];
    return parseFloat(qString);
  } catch (err) {
    return -1;
  }
}

function extractSize(str: string): number {
  try {
    const sizeMatched = str.match(/size=[ .-\d]*kB/)[0];
    const sizeString = sizeMatched.match(/[.-\d]+/)[0];
    return parseFloat(sizeString);
  } catch (err) {
    return -1;
  }
}

function extractTime(str: string): number {
  try {
    const timeMatched = str.match(/time=[ .:\d]*/)[0];
    const timeString = timeMatched.match(/[.:\d]+/)[0];
    const matches = timeString.match(/\d+/g);
    
    if (matches.length !== 4) {
      return -1;
    }
    
    const n1 = parseInt(matches[0], 10);
    const n2 = parseInt(matches[1], 10);
    const n3 = parseInt(matches[2], 10);
    const n4 = parseInt(matches[3], 10);
    
    return (n1 * 3600) + (n2 * 60) + n3 + (n4 / 100);
  } catch (err) {
    return -1;
  }
}

function extractBitrate(str: string): number {
  try {
    const bitrateMatched = str.match(/bitrate=[ .-\d]*kbits\/s/)[0];
    const bitrateString = bitrateMatched.match(/[.-\d]+/)[0];
    return parseFloat(bitrateString);
  } catch (err) {
    return -1;
  }
}

function extractSpeed(str: string): number {
  try {
    const speedMatched = str.match(/speed=[ .-\d]*x/)[0];
    const speedString = speedMatched.match(/[.-\d]+/)[0];
    return parseFloat(speedString);
  } catch (err) {
    return -1;
  }
}
