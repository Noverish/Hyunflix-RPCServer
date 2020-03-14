import { assert } from 'chai';
import 'mocha';

import ffmpeg from '@src/functions/ffmpeg';
import { FFMpegStatus } from '@src/models';

const STATUS_MOCK: FFMpegStatus = {
  frame: 0, fps: 0, q: 0, size: 0, time: 0, bitrate: 0, speed: 0, progress: 0, eta: 0,
};

const tests = [
  {
    title: 'test1.mkv',
    inpath: '/Movies/test/test1.mkv',
    outpath: '/Movies/test/test_output.mp4',
    args: '-vcodec libx264 -acodec aac -ac 2 -t 3 -y'.split(' '),
    expected: '/Musics/download/[MV] IU(아이유) _ Blueming(블루밍).webm',
  },
];

describe('ffmpeg', () => {
  for (const test of tests) {
    it(test.title, async function () {
      this.timeout(0);
      const { inpath, outpath, args } = test;
      const pid: number = await ffmpeg(inpath, outpath, args, (p: number, event: string, status: FFMpegStatus) => {
        console.log(p, event, status);
        assert.equal(p, pid);
        assert.hasAllKeys(status, STATUS_MOCK);
      });
    });
  }
});

/*
import { assert } from 'chai';
import 'mocha';

import { ffmpeg } from '@src/rpc';
import { FFMpegStatus } from '@src/models';

const STATUS_MOCK: FFMpegStatus = { frame: 0, fps: 0, q: 0, size: 0, time: 0, bitrate: 0, speed: 0, progress: 0, eta: 0 };

describe('RPC - ffmpeg', () => {
  it('test1.mkv', async function () {
    this.timeout(0);
    const inpath = '/Movies/test/test1.mkv';
    const outpath = '/Movies/test/test_output.mp4';
    const args = '-vcodec libx264 -acodec aac -ac 2 -t 1 -y'.split(' ');

    await ffmpeg(inpath, outpath, args, (status: FFMpegStatus) => {
      assert.hasAllKeys(status, STATUS_MOCK);
    });
  });

  it('error1.avi', async function () {
    this.timeout(0);
    const inpath = '/Movies/test/error1.avi';
    const outpath = '/Movies/test/test_output.mp4';
    const args = '-vcodec libx264 -acodec aac -ac 2 -t 1 -y'.split(' ');

    await ffmpeg(inpath, outpath, args, (status: FFMpegStatus) => {
      assert.hasAllKeys(status, STATUS_MOCK);
    });
  });
});

*/
