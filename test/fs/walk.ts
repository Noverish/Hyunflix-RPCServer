import 'mocha';

import { walk } from '@src/functions/fs';

describe('fs - walk', () => {
  it('/Movies', async () => {
    const files: string[] = await walk('/Movies');
    console.log(files);
  });
});
