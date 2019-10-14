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

router.get('/walk', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const path = req.query['path'];
    
    const paths: string[] = await fs.walk(path);
    
    res.status(200);
    res.json(paths);
  })().catch(next);
})

router.get('/access', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const path = req.query['path'];
    
    const error: string = await fs.access(path);
    
    res.status(200);
    res.json({ error });
  })().catch(next);
})

router.get('/lstat', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const path = req.query['path'];
    
    const stats = await fs.lstat(path);
    
    res.status(200);
    res.json(stats);
  })().catch(next);
})

export default router;