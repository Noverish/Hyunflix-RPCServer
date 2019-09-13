import { IncomingMessage, ServerResponse } from 'http';
import { exec } from '@src/utils/child-process';

import * as state from './state';

export default async function(req: IncomingMessage, res: ServerResponse) {
  const pid: string = await exec('pgrep ffmpeg');
  
  if(!pid) {
    res.statusCode = 404;
    res.end(JSON.stringify({ msg: 'ffmpeg 프로세스가 존재하지 않습니다' }));
    return;
  }
  
  const isRunning: boolean = await state.isRunning(pid);
  
  if(isRunning) {
    await exec(`kill -stop ${pid}`);
    res.statusCode = 204;
    res.end();
  } else {
    res.statusCode = 400;
    res.end(JSON.stringify({ msg: '이미 프로세스가 정지되어 있습니다' }));
  }
}
