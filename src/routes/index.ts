import { Router } from 'express';

import ffmpeg from './ffmpeg';
import ffprobe from './ffprobe';
import encode from './encode';
import youtube from './youtube';
import subtitle from './subtitle';

const router: Router = Router();

router.use('/encode', encode);
router.use('/ffmpeg', ffmpeg);
router.use('/youtube', youtube);
router.use('/ffprobe', ffprobe);
router.use('/subtitle', subtitle);

export default router;
