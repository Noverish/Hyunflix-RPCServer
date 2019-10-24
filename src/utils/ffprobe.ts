import { exec } from '@src/utils/child-process';
import { escapeShellArg } from '@src/utils';

type RawProbed = object;

export interface FFProbe {
  duration: number;
  bitrate: number;
  size: number;
}

export interface FFProbeVideo extends FFProbe {
  width: number;
  height: number;
}

export interface FFProbeMusic extends FFProbe {
  
}

async function probe(pathParam: string): Promise<RawProbed> {
  const path = escapeShellArg(pathParam);
  const result = await exec(`ffprobe -v quiet -print_format json -show_format -show_streams ${path}`);
  return JSON.parse(result);
}

function parseFFProbe(probed: RawProbed): FFProbe {
  const format = probed['format'];
  
  const duration: number = parseFloat(format['duration']);
  const bitrate: number = parseInt(format['bit_rate']);
  const size: number = parseInt(format['size']);
  
  return { duration, bitrate, size }
}

function parseFFProbeVideo(probed: RawProbed): FFProbeVideo {
  const ffprobe: FFProbe = parseFFProbe(probed);
  const stream = probed['streams'].find(s => s['codec_type'] === 'video');
  
  const width = parseInt(stream['width']);
  const height = parseInt(stream['height']);
  
  return {
    ...ffprobe,
    width,
    height
  }
}

function parseFFProbeMusic(probed: RawProbed): FFProbeMusic {
  const ffprobe: FFProbe = parseFFProbe(probed);
  return ffprobe;
}

export async function ffprobe(path: string): Promise<FFProbe> {
  const probed: RawProbed = await probe(path);
  return parseFFProbe(probed);
}

export async function ffprobeVideo(path: string): Promise<FFProbeVideo> {
  const probed: RawProbed = await probe(path);
  return parseFFProbeVideo(probed);
}

export async function ffprobeMusic(path: string): Promise<FFProbeMusic> {
  const probed: RawProbed = await probe(path);
  return parseFFProbeMusic(probed);
}
