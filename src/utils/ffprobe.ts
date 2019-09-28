import { exec } from '@src/utils/child-process';
import { escapeShellArg } from '@src/utils';

export interface FFProbe {
  duration: number;
}

export async function ffprobe(pathParam: string): Promise<FFProbe> {
  const path = escapeShellArg(pathParam);
  
  const result = await exec(`ffprobe -v quiet -print_format json -show_format -show_streams ${path}`);
  const info = JSON.parse(result);
  const duration: number = parseFloat(info['format']['duration']);
  
  return { duration }
}
