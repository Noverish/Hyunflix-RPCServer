import { join, extname, dirname, parse } from 'path';

import { readdir } from './fs';
import { Subtitle } from '@src/models';

const subtitleExtList = ['.smi', '.srt', '.vtt'];

export async function subtitle(path: string): Promise<Subtitle[]> {
  if (extname(path) !== '.mp4') {
    throw new Error(`'${path}' is not mp4`);
  }

  const dirPath = dirname(path);
  const files = await readdir(dirPath);
  const subtitles: Subtitle[] = [];

  for (const file of files) {
    const { name, ext } = parse(file);

    if (name === parse(path).name && subtitleExtList.includes(ext)) {
      subtitles.push({
        language: 'ko',
        path: join(dirPath, `${name}.vtt`),
      });
    }
  }

  // There is no subtitle file which name is same as video name
  if (subtitles.length === 0) {
    for (const file of files) {
      const { name, ext } = parse(file);
      if (subtitleExtList.includes(ext)) {
        subtitles.push({
          language: name,
          path: join(dirPath, `${name}.vtt`),
        });
      }
    }
  }

  return subtitles;
}