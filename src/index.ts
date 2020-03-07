import * as jayson from 'jayson';
import { send } from '@src/sse';

import { ffmpeg } from '@src/functions/ffmpeg';
import { ffprobeVideo, ffprobeMusic } from '@src/functions/ffprobe';
import { readdir, rename, unlink, unlinkBulk, stat, statBulk, walk } from '@src/functions/fs';
import { ffmpegExist, ffmpegState, ffmpegPause, ffmpegResume } from '@src/functions/ffstate';
import { subtitle } from '@src/functions/subtitle';
import { downloadYoutube, getYoutubePlaylist } from '@src/functions/youtube';
import * as logger from '@src/utils/logger';
import { RPC_SERVER_PORT } from '@src/config';

function call(promiseCallback: (args: any) => Promise<any>) {
  return (args, callback) => {
    const name = promiseCallback.toString().match(/\.[^(]*/)[0].substr(1);

    promiseCallback(args)
      .then((result) => {
        logger.rpc(name, JSON.stringify(args), JSON.stringify(result));
        callback(null, result);
      })
      .catch((error) => {
        const errStr = error.stack || error.toString();
        const err = {
          code: errStr.length,
          message: errStr,
        };
        logger.rpc(name, JSON.stringify(args), errStr);
        callback(err, null);
      });
  };
}

const jaysonServer = new jayson.Server({
  ffmpeg:       call(args => ffmpeg(args.inpath, args.outpath, args.args, (pid, event, status) => send(`/ffmpeg/${pid}`, status, event))),
  ffmpegExist:  call(() => ffmpegExist()),
  ffmpegState:  call(() => ffmpegState()),
  ffmpegPause:  call(() => ffmpegPause()),
  ffmpegResume: call(() => ffmpegResume()),
  ffprobeVideo: call(args => ffprobeVideo(args.path)),
  ffprobeMusic: call(args => ffprobeMusic(args.path)),

  readdir:    call(args => readdir(args.path)),
  rename:     call(args => rename(args.from, args.to)),
  unlink:     call(args => unlink(args.path)),
  unlinkBulk: call(args => unlinkBulk(args.paths)),
  stat:       call(args => stat(args.path)),
  statBulk:   call(args => statBulk(args.paths)),
  walk:       call(args => walk(args.path)),

  subtitle:   call(args => subtitle(args.path)),

  getYoutubePlaylist: call(args => getYoutubePlaylist(args.url)),
  downloadYoutube :    call(args => downloadYoutube(args.url, (status) => { send('/youtube', status); })),
});

jaysonServer.http().listen(RPC_SERVER_PORT);
console.log(`*** RPC Server Started at ${RPC_SERVER_PORT} !!!`);
