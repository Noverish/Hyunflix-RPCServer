import { Router, Request, Response, NextFunction } from 'express';
import { ffprobeVideo, ffprobeMusic, FFProbeVideo, FFProbeMusic } from '@src/utils/ffprobe';
import { checkAuthority } from '@src/middlewares/validate-header';
import { ARCHIVE_PATH } from '@src/config';

const router: Router = Router();

router.get('/video', checkAuthority('api'), (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const path: string = req.query['path'];
    
    const result: FFProbeVideo = await ffprobeVideo(ARCHIVE_PATH + path);
    
    res.status(200);
    res.json(result)
  })().catch(next);
})

router.get('/music', checkAuthority('api'), (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const path: string = req.query['path'];
    
    const result: FFProbeMusic = await ffprobeMusic(ARCHIVE_PATH + path);
    
    res.status(200);
    res.json(result)
  })().catch(next);
})

export default router;