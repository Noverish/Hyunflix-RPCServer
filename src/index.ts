import * as jayson from 'jayson';
import { createServer, send } from '@src/sse';

import { ffmpeg } from '@src/functions/ffmpeg';
import { ffprobeVideo, ffprobeMusic } from '@src/functions/ffprobe';
import { readdir, rename, unlink, unlinkBulk, stat, statBulk, walk } from '@src/functions/fs';
import { ffmpegExist, ffmpegState, ffmpegPause, ffmpegResume } from '@src/functions/ffstate';
import { subtitle } from '@src/functions/subtitle';
import { downloadYoutube } from '@src/functions/youtube';
import * as logger from '@src/utils/logger';

function call(promiseCallback: (args: any) => Promise<any>) {
  return (args, callback) => {
    const name = promiseCallback.toString().match(/\.[^(]*/)[0].substr(1);
    
    promiseCallback(args)
      .then((result) => {
        logger.rpc(name, JSON.stringify(args), JSON.stringify(result));
        callback(null, result);
      })
      .catch(error => {
        const err = {
          code: error.toString().length,
          message: error.toString(),
        };
        logger.rpc(name, JSON.stringify(args), err.message);
        callback(err, null);
      });
  };
}

createServer('/ffmpeg');
createServer('/youtube');

const jaysonServer = new jayson.Server({
  ffmpeg:       call((args) => ffmpeg(args.args, (status) => { send('/ffmpeg', status) })),
  ffmpegExist:  call(() => ffmpegExist()),
  ffmpegState:  call(() => ffmpegState()),
  ffmpegPause:  call(() => ffmpegPause()),
  ffmpegResume: call(() => ffmpegResume()),
  ffprobeVideo: call((args) => ffprobeVideo(args.path)),
  ffprobeMusic: call((args) => ffprobeMusic(args.path)),
  
  readdir:    call((args) => readdir(args.path)),
  rename:     call((args) => rename(args.from, args.to)),
  unlink:     call((args) => unlink(args.path)),
  unlinkBulk: call((args) => unlinkBulk(args.paths)),
  stat:       call((args) => stat(args.path)),
  statBulk:   call((args) => statBulk(args.paths)),
  walk:       call((args) => walk(args.path)),
  
  subtitle: call((args) => subtitle(args.path)),
  
  downloadYoutube : call((args) => downloadYoutube(args.url, (status) => { send('/youtube', status) })),
});

jaysonServer.http().listen(8123);
