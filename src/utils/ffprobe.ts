import { exec } from '@src/utils/child-process';
import { escapeShellArg } from '@src/utils';

export interface FFProbe {
  duration: number;
}

export interface FFProbeVideo extends FFProbe {
  width: number;
  height: number;
  bitrate: number;
  size: number;
}

async function probe(pathParam: string): Promise<object> {
  const path = escapeShellArg(pathParam);
  const result = await exec(`ffprobe -v quiet -print_format json -show_format -show_streams ${path}`);
  return JSON.parse(result);
}

function parseFFProbe(probed: object): FFProbe {
  const duration: number = parseFloat(probed['format']['duration']);
  return { duration }
}

function parseFFProbeVideo(probed: object): FFProbeVideo {
  const ffprobe: FFProbe = parseFFProbe(probed);
  
  const stream = probed['streams'].find(s => s['codec_type'] === 'video');
  const format = probed['format'];
  
  const width = parseInt(stream['width']);
  const height = parseInt(stream['height']);
  const bitrate = parseInt(format['bit_rate']);
  const size = parseInt(format['size']);
  
  return {
    ...ffprobe,
    width,
    height,
    bitrate,
    size
  }
}

export async function ffprobe(path: string): Promise<FFProbe> {
  const probed = await probe(path);
  return parseFFProbe(probed);
}

export async function ffprobeVideo(path: string): Promise<FFProbeVideo> {
  const probed = await probe(path);
  return parseFFProbeVideo(probed);
}
