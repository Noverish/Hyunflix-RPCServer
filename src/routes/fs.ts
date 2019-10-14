import { Router, Request, Response, NextFunction } from 'express';

import * as fs from '@src/fs';
import { File } from '@src/models';

const router: Router = Router();

router.get('/readdir', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const path = req.query['path'];
    
    const files: File[] = await fs.readdirDetail(path);
    
    res.status(200);
    res.json(files);
  })().catch(next);
})

export default router;