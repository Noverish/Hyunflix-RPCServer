import { Router, Request, Response, NextFunction } from 'express';

import { Youtube } from '@src/entity';
import youtube from '@src/worker/youtube';

const router: Router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  (async function () {
    const youtubes: Youtube[] = await Youtube.findAll();

    res.status(200);
    res.json(youtubes);
  })().catch(next);
});

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  (async function () {
    const music: boolean = req.body['music'];
    const video: boolean = req.body['video'];
    const url: string = req.body['url'];
    const tags: string[] = req.body['tags'];

    await Youtube.insert(music, url);

    youtube(url, tags, music, video);

    res.status(204);
    res.end();
  })().catch(next);
});

export default router;
