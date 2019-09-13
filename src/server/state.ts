import { IncomingMessage, ServerResponse } from 'http';
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

export default async function(req: IncomingMessage, res: ServerResponse) {
  const pid: string = await exec('pgrep ffmpeg');
  
  if(!pid) {
    res.statusCode = 404;
    res.end(JSON.stringify({ msg: 'ffmpeg 프로세스가 존재하지 않습니다' }));
    return;
  }
  
  res.statusCode = 200;
  res.end(JSON.stringify({ running: await isRunning(pid) }));
}
