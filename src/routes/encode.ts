import { Router, Request, Response, NextFunction } from 'express';

import { Encode } from '@src/entity';
import { checkAuthority } from '@src/middlewares/validate-header';
import { workNotDone } from '@src/worker/ffmpeg';

const router: Router = Router();

router.get('/presets', checkAuthority('admin'), (req: Request, res: Response, next: NextFunction) => {
  const presets = {
    pass1: [
      '-c:v', 'libx264',
      '-b:v', '2000k',
      '-pass', '1',
      '-vf', 'scale=1280:-2',
      '-map_chapters', '-1',
      '-f', 'mp4',
      '-an', '-y',
    ].join(' '),

    pass2: [
      '-c:v', 'libx264',
      '-b:v', '2000k',
      '-pass', '2',
      '-vf', 'scale=1280:-2',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ac', '2',
      '-map_chapters', '-1',
      '-y',
    ].join(' '),

    mkv2mp4: [
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ac', '2',
      '-map_chapters', '-1',
      '-y',
    ].join(' '),

    maxrate: [
      '-c:v', 'libx264',
      '-b:v', '2000k',
      '-maxrate', '2000k',
      '-bufsize', '4000k',
      '-vf', 'scale=1280:-2',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ac', '2',
      '-map_chapters', '-1',
      '-y',
    ].join(' '),
  };

  res.status(200);
  res.json(presets);
});

router.post('/', checkAuthority('admin'), (req: Request, res: Response, next: NextFunction) => {
  (async function () {
    const inpath = req.body['inpath'];
    const outpath = req.body['outpath'];
    const options = req.body['options'];

    await Encode.insert(inpath, outpath, options);

    workNotDone();

    res.status(204);
    res.end();
  })().catch(next);
});

router.get('/status', checkAuthority('admin'), (req: Request, res: Response, next: NextFunction) => {
  (async function () {
    const encodes: Encode[] = await Encode.findAll();

    res.status(200);
    res.json(encodes);
  })().catch(next);
});

export default router;
