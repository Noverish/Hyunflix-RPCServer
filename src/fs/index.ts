import { promises as fsPromises } from 'fs';
import { join } from 'path';

import { ARCHIVE_PATH } from '@src/config';

export async function readdir(path: string): Promise<string[]> {
  const realPath = join(ARCHIVE_PATH, path);
  
  const realList = await fsPromises.readdir(realPath);
  
  const fakeList = realList.map(v => v.replace(ARCHIVE_PATH, ''));
  
  return fakeList;
}