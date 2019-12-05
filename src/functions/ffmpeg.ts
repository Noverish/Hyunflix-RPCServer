import { spawn } from 'child_process';
import { join } from 'path';

import { ffprobeCommon } from '@src/functions/ffprobe';
import { FFMpegStatus, FFProbeCommon } from '@src/models';
import { ARCHIVE_PATH } from '@src/config';
import { send } from '@src/sse';

const STATUS_EVENT = 'status';
const FINISH_EVENT = 'finish';
const ERROR_EVENT = 'error';

export async function ffmpeg(inpath: string, outpath: string, args: string[]): Promise<number> {
  const { duration }: FFProbeCommon = await ffprobeCommon(inpath);

  const realInpath = join(ARCHIVE_PATH, inpath);
  const realOutpath = (outpath === '/dev/null') ? outpath : join(ARCHIVE_PATH, outpath);
  const args2 = [
    '-i', realInpath,
    ...args,
    realOutpath,
  ];

  let stdouts = '';
  const ffmpeg = spawn('ffmpeg', args2);
  const ssePath = `/ffmpeg/${ffmpeg.pid}`;

  ffmpeg.stdout.on('data', (data) => {
    stdouts += data.toString();
  });

  ffmpeg.stderr.on('data', (data) => {
    const status = extract(duration, data.toString());
    if (status) {
      send(ssePath, status, STATUS_EVENT);
    } else {
      stdouts += data.toString();
    }
  });

  ffmpeg.on('exit', (code: number) => {
    if (code === 0) {
      send(ssePath, FINISH_EVENT, FINISH_EVENT);
    } else {
      send(ssePath, stdouts, ERROR_EVENT);
    }
  });

  return ffmpeg.pid;
}

function extract(duration: number, data: string): FFMpegStatus | null {
  const time = extractTime(data);
  const speed = extractSpeed(data);

  if (time <= 0 || speed <= 0) {
    return null;
  }

  const progress = parseFloat((time / duration * 100).toFixed(2));
  const etaRaw = (duration - time) / speed;
  const eta = parseFloat(etaRaw.toFixed(1));

  const tmp: FFMpegStatus = {
    time,
    speed,
    progress,
    eta,
    frame: extractFrame(data),
    fps: extractFPS(data),
    q: extractQ(data),
    size: extractSize(data),
    bitrate: extractBitrate(data),
  };

  return tmp;
}

function extractFrame(str: string): number {
  try {
    const frameMatched = str.match(/frame=[ .-\d]*/);
    const frameString = frameMatched[0].match(/[.-\d]+/)[0];
    return parseFloat(frameString);
  } catch (err) {
    return -1;
  }
}

function extractFPS(str: string): number {
  try {
    const fpsMatched = str.match(/fps=[ .-\d]*/);
    const fpsString = fpsMatched[0].match(/[.-\d]+/)[0];
    return parseFloat(fpsString);
  } catch (err) {
    return -1;
  }
}

function extractQ(str: string): number {
  try {
    const qMatched = str.match(/q=[ .-\d]*/);
    const qString = qMatched[0].match(/[.-\d]+/)[0];
    return parseFloat(qString);
  } catch (err) {
    return -1;
  }
}

function extractSize(str: string): number {
  try {
    const sizeMatched = str.match(/size=[ .-\d]*kB/);
    const sizeString = sizeMatched[0].match(/[.-\d]+/)[0];
    return parseFloat(sizeString);
  } catch (err) {
    return -1;
  }
}

function extractTime(str: string): number {
  try {
    const timeMatched = str.match(/time=[ .:\d]*/);
    const timeString = timeMatched[0].match(/[.:\d]+/)[0];
    const matches = timeString.match(/\d+/g);

    if (matches.length !== 4) {
      return -1;
    }

    const n1 = parseInt(matches[0], 10);
    const n2 = parseInt(matches[1], 10);
    const n3 = parseInt(matches[2], 10);
    const n4 = parseInt(matches[3], 10);

    const tmp = (n1 * 3600) + (n2 * 60) + n3 + (n4 / 100);
    return parseFloat(tmp.toFixed(2));
  } catch (err) {
    return -1;
  }
}

function extractBitrate(str: string): number {
  try {
    const bitrateMatched = str.match(/bitrate=[ .-\d]*kbits\/s/);
    const bitrateString = bitrateMatched[0].match(/[.-\d]+/)[0];
    return parseFloat(bitrateString);
  } catch (err) {
    return -1;
  }
}

function extractSpeed(str: string): number {
  try {
    const speedMatched = str.match(/speed=[ .-\d]*x/);
    const speedString = speedMatched[0].match(/[.-\d]+/)[0];
    return parseFloat(speedString);
  } catch (err) {
    return -1;
  }
}
