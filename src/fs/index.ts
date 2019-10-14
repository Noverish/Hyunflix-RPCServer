import * as fs from 'fs';
import { join } from 'path';

import { File } from '@src/models';
import { ARCHIVE_PATH } from '@src/config';
const fsPromises = fs.promises;

export async function readdir(path: string): Promise<string[]> {
  const realPath = join(ARCHIVE_PATH, path);
  
  const realList = await fsPromises.readdir(realPath);
  
  const fakeList = realList.map(v => v.replace(ARCHIVE_PATH, ''));
  
  return fakeList;
}

export async function readdirDetail(path: string): Promise<File[]> {
  const realPath = join(ARCHIVE_PATH, path);

  const files: fs.Dirent[] = await fsPromises.readdir(realPath, { withFileTypes: true });
  const results: File[] = [];

  for (const f of files) {
    const isdir = f.isDirectory();
    const realfilePath = join(realPath, f.name);
    const filePath = join(path, f.name);

    if (isdir) {
      const file: File = {
        isdir,
        path: filePath,
        name: f.name,
        size: 0,
      };

      results.push(file);
    } else {
      const stat = await fsPromises.lstat(realfilePath);

      results.push({
        isdir,
        path: filePath,
        name: f.name,
        size: stat.size,
      });
    }
  }

  return results;
}