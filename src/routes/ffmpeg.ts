import { Router, Request, Response, NextFunction } from 'express';
import { exec } from '@src/utils/child-process';

const router: Router = Router();

async function isRunning(pid: string) {
  const processState: string = await exec(`ps -o stat= -p ${pid}`);
  
  if (processState === 'Sl') {
    return true;
  } else if (processState === 'Tl') {
    return false;
  } else {
    throw new Error(`Unknown process state: '${processState}'`);
  }
}

router.get('/state', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const pid: string = await exec('pgrep ffmpeg');
    
    if(!pid) {
      res.status(404);
      res.json({ msg: 'ffmpeg 프로세스가 존재하지 않습니다' });
      return;
    }
    
    res.status(200);
    res.json({ running: await isRunning(pid) });
  })().catch(next);
})


router.post('/pause', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const pid: string = await exec('pgrep ffmpeg');
    
    if(!pid) {
      res.status(404);
      res.json({ msg: 'ffmpeg 프로세스가 존재하지 않습니다' });
      return;
    }
    
    if(await isRunning(pid)) {
      await exec(`kill -stop ${pid}`);
      res.status(204);
      res.end();
    } else {
      res.status(400);
      res.json({ msg: '이미 프로세스가 정지되어 있습니다' });
    }
  })().catch(next);
})

router.post('/resume', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const pid: string = await exec('pgrep ffmpeg');
    
    if(!pid) {
      res.status(404);
      res.json({ msg: 'ffmpeg 프로세스가 존재하지 않습니다' });
      return;
    }
    
    if(!await isRunning(pid)) {
      await exec(`kill -cont ${pid}`);
      res.status(204);
      res.end();
    } else {
      res.status(400);
      res.json({ msg: '이미 프로세스가 실행중입니다' });
    }
  })().catch(next);
})

export default router;