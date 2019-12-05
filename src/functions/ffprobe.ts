import { join } from 'path';

import { escapeShellArg, exec } from '@src/utils';
import { RawProbed, FFProbeCommon, FFProbeVideo, FFProbeMusic } from '@src/models';
import { ARCHIVE_PATH } from '@src/config';

async function probe(path: string): Promise<RawProbed> {
  const escapedPath = escapeShellArg(path);
  const result = await exec(`ffprobe -v error -print_format json -show_format -show_streams ${escapedPath}`);
  return JSON.parse(result);
}

function parseFFProbeCommon(probed: RawProbed): FFProbeCommon {
  const format = probed['format'];
  
  const duration: number = parseFloat(format['duration']);
  const bitrate: number = parseInt(format['bit_rate']);
  const size: number = parseInt(format['size']);
  
  return { duration, bitrate, size }
}

function parseFFProbeVideo(probed: RawProbed): FFProbeVideo {
  const ffprobe: FFProbeCommon = parseFFProbeCommon(probed);
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
  const ffprobe: FFProbeCommon = parseFFProbeCommon(probed);
  return ffprobe;
}

export async function ffprobeCommon(path: string): Promise<FFProbeCommon> {
  const realPath = join(ARCHIVE_PATH, path);
  const probed: RawProbed = await probe(realPath);
  return parseFFProbeCommon(probed);
}

export async function ffprobeVideo(path: string): Promise<FFProbeVideo> {
  const realPath = join(ARCHIVE_PATH, path);
  const probed: RawProbed = await probe(realPath);
  return parseFFProbeVideo(probed);
}

export async function ffprobeMusic(path: string): Promise<FFProbeMusic> {
  const realPath = join(ARCHIVE_PATH, path);
  const probed: RawProbed = await probe(realPath);
  return parseFFProbeMusic(probed);
}
