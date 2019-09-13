import { exec } from '@src/utils/child-process';

export interface FFProbeVideo {
  duration: number;
  frame: number;
  width: number;
  height: number;
  bitrate: number;
  size: number;
}

export interface FFProbeAudio {
  duration: number;
}

export async function ffprobeVideo(path: string): Promise<FFProbeVideo> {
  const result = await exec(`ffprobe -v quiet -print_format json -show_format -show_streams '${path}'`);
  
  const info = JSON.parse(result)
  const stream = info['streams'].find(s => s['codec_type'] === 'video');
  const format = info['format'];
  
  const tmp = stream['avg_frame_rate'].split('/');
  const avgFrameRate = parseInt(tmp[0]) / parseInt(tmp[1]);
  
  const duration = parseFloat(stream['duration'] || format['duration']);
  const frame = parseInt(stream['nb_frames']) || (duration * avgFrameRate);
  const width = parseInt(stream['width']);
  const height = parseInt(stream['height']);
  const bitrate = parseInt(format['bit_rate']);
  const size = parseInt(format['size']);
  
  if(duration && frame && width && height && bitrate && size) {
    return { duration, frame, width, height, bitrate, size };
  } else {
    throw new Error(`Cannot probe video: ${path}`);
  }
}

export async function ffprobeAudio(path: string): Promise<FFProbeAudio> {
  const result = await exec(`ffprobe -v quiet -print_format json -show_format -show_streams '${path}'`);
  
  const info = JSON.parse(result)
  const stream = info['streams'][0];

  return {
    duration: parseFloat(stream['duration'])
  };
}