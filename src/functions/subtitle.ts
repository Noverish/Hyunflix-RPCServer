import {
  join, extname, dirname, parse,
} from 'path';

import { Subtitle } from '@src/models';
import { readdir } from './fs';

const subtitleExtList = ['.smi', '.srt', '.vtt'];

export default async function (path: string): Promise<Subtitle[]> {
  if (extname(path) !== '.mp4') {
    throw new Error(`'${path}' is not mp4`);
  }

  const videoDirPath = dirname(path);
  const videoName = parse(path).name;

  return (await readdir(videoDirPath))
    .filter((f) => f.startsWith(videoName))
    .filter((f) => subtitleExtList.includes(extname(f)))
    .map((f): Subtitle => {
      const fileName = parse(f).name;
      const language = fileName.replace(videoName, '').replace(/\./g, '');

      return {
        path: join(videoDirPath, `${fileName}.vtt`),
        language: (language === '') ? 'default' : language,
      };
    })
    .sort((a, b) => {
      if (a.language === 'default') {
        return -1;
      }
      if (b.language === 'default') {
        return 1;
      }
      return 0;
    });
}
