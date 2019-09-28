import { Request, Response, NextFunction } from 'express';
import { exec } from '@src/utils/child-process';

export async function isRunning(pid: string) {
  const processState: string = await exec(`ps -o stat= -p ${pid}`);
  
  if (processState === 'Sl') {
    return true;
  } else if (processState === 'Tl') {
    return false;
  } else {
    throw new Error(`Unknown process state: '${processState}'`);
  }
}

export default function(req: Request, res: Response, next: NextFunction) {
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
}
