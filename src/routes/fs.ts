import { Router, Request, Response, NextFunction } from 'express';

import * as fs from '@src/fs';
import { File, Stat } from '@src/models';

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

router.get('/stat', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const path = req.query['path'];
    
    const stats = await fs.stat(path);
    
    res.status(200);
    res.json(stats);
  })().catch(next);
})

router.post('/stat-bulk', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const paths: string[] = req.body['paths'];
    const stats: Stat[] = []
    
    for(const path of paths) {
      stats.push(await fs.stat(path));
    }
    
    res.status(200);
    res.json(stats);
  })().catch(next);
})

export default router;