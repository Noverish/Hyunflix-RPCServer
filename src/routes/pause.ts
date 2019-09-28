import { Request, Response, NextFunction } from 'express';
import { exec } from '@src/utils/child-process';

import * as state from './state';

export default function(req: Request, res: Response, next: NextFunction) {
  (async () => {
    const pid: string = await exec('pgrep ffmpeg');
    
    if(!pid) {
      res.status(404);
      res.json({ msg: 'ffmpeg 프로세스가 존재하지 않습니다' });
      return;
    }
    
    const isRunning: boolean = await state.isRunning(pid);
    
    if(isRunning) {
      await exec(`kill -stop ${pid}`);
      res.status(204);
      res.end();
    } else {
      res.status(400);
      res.json({ msg: '이미 프로세스가 정지되어 있습니다' });
    }
  })().catch(next);
}
