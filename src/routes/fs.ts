import { Router, Request, Response, NextFunction } from 'express';

import * as fs from '@src/fs';
import { Stat } from '@src/models';
import { checkAuthority } from '@src/middlewares/validate-header';

const router: Router = Router();

router.use(checkAuthority('api'));

router.get('/readdir', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const path = req.query['path'];
    
    const stats: Stat[] = await fs.readdirStat(path);
    
    res.status(200);
    res.json(stats);
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

router.post('/unlink-bulk', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const paths: string[] = req.body['paths'];
    
    for(const path of paths) {
      await fs.unlink(path);
    }
    
    res.status(204);
    res.json();
  })().catch(next);
})

export default router;