import { assert } from 'chai';
import 'mocha';

import { downloadYoutube } from '@src/functions/youtube';
import { YoutubeStatus } from '@src/models';

const STATUS_MOCK: YoutubeStatus = {
  progress: 0, total: 0, speed: 0, eta: 0,
};

const tests = [
  {
    title: '[MV] IU(아이유) _ Blueming(블루밍)',
    url: 'https://www.youtube.com/watch?v=D1PvIWdJ8xo',
    expected: '/Musics/download/[MV] IU(아이유) _ Blueming(블루밍).webm',
  },
];

describe('downloadYoutube', () => {
  for (const test of tests) {
    it(test.title, async function () {
      this.timeout(0);
      const path = await downloadYoutube(test.url, (status: YoutubeStatus) => {
        assert.hasAllKeys(status, STATUS_MOCK);
      });
      assert.deepEqual(path, test.expected);
    });
  }
});
