import { assert } from 'chai';
import 'mocha';

import { getYoutubePlaylist } from '@src/functions/youtube';

const tests = [
  {
    title: 'playlist url',
    url: 'https://www.youtube.com/playlist?list=PLHFlHpPjgk704bliuD3qP37EzVNNypOJi',
    expected: [{ id: '7Glc2mHLPRM', title: 'Look what you can do with iPadOS \u2014 Apple' }]
  },
  {
    title: 'video url with playlist id',
    url: 'https://www.youtube.com/watch?v=7Glc2mHLPRM&list=PLHFlHpPjgk704bliuD3qP37EzVNNypOJi&index=2&t=0s',
    expected: [{ id: '7Glc2mHLPRM', title: 'Look what you can do with iPadOS \u2014 Apple' }]
  },
]

describe('getYoutubePlaylist', () => {
  for (const test of tests) {
    it(test.title, async function () {
      this.timeout(0);
      const items = await getYoutubePlaylist(test.url);
      assert.deepEqual(items, test.expected);
    })
  }
})