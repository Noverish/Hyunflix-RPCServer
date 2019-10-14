import { Router, Request, Response, NextFunction } from 'express';
import { join, extname, dirname, parse } from 'path';

import * as fs from '@src/fs';
import { Subtitle } from '@src/models';

const router: Router = Router();
const subtitleExtList = ['.smi', '.srt', '.vtt'];

export async function findSubtitle(videoPath: string): Promise<Subtitle[]> {
  if (extname(videoPath) !== '.mp4') {
    throw new Error(`'${videoPath}' is not mp4`);
  }

  const dirPath = dirname(videoPath);
  const files = await fs.readdir(dirPath);
  const subtitles: Subtitle[] = [];

  for (const file of files) {
    const { name, ext } = parse(file);

    if (name === parse(videoPath).name && subtitleExtList.includes(ext)) {
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

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const videoPath = req.body['videoPath'];
    
    const subtitles: Subtitle[] = await findSubtitle(videoPath);
    
    res.status(200);
    res.json(subtitles);
  })().catch(next);
})

export default router;