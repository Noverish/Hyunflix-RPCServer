import { Router, Request, Response, NextFunction } from 'express';
import { ffprobeVideo, FFProbeVideo } from '@src/utils/ffprobe';
import { checkBackend } from '@src/middlewares/check-admin';
import { ARCHIVE_PATH } from '@src/config';

const router: Router = Router();

router.get('/video', checkBackend, (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const path: string = req.query['path'];
    
    const result: FFProbeVideo = await ffprobeVideo(ARCHIVE_PATH + path);
    
    res.status(200);
    res.json(result)
  })().catch(next);
})

export default router;