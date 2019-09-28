import { Router } from 'express';

import pause from './pause';
import resume from './resume';
import state from './state';
import encode from './encode';

const router: Router = Router();

router.use('/encode', encode);
router.post('/pause', pause);
router.post('/resume', resume);
router.get('/state', state);

export default router;
