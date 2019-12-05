import * as fs from 'fs';
import { join, basename, dirname } from 'path';

import { Stat } from '@src/models';
import { ARCHIVE_PATH } from '@src/config';
const fsPromises = fs.promises;

export async function readdir(path: string): Promise<string[]> {
  const realPath = join(ARCHIVE_PATH, path);
  return await fsPromises.readdir(realPath);
}

export async function rename(from: string, to: string): Promise<void> {
  const realFrom = join(ARCHIVE_PATH, from);
  const realTo = join(ARCHIVE_PATH, to);

  try {
    await fsPromises.access(dirname(realTo));
  } catch (error) {
    await fsPromises.mkdir(dirname(realTo), { recursive: true });
  }

  return await fsPromises.rename(realFrom, realTo);
}

export async function unlink(path: string): Promise<void> {
  const realPath = join(ARCHIVE_PATH, path);
  return await fsPromises.unlink(realPath);
}

export async function unlinkBulk(paths: string[]): Promise<void> {
  for (const path of paths) {
    await unlink(path);
  }
}

export async function stat(path: string): Promise<Stat> {
  const realPath = join(ARCHIVE_PATH, path);
  const stat = await fsPromises.stat(realPath);
  return {
    path,
    name: basename(path),
    size: stat.size,
    isdir: stat.isDirectory(),
  };
}

export async function statBulk(paths: string[]): Promise<Stat[]> {
  const stats: Stat[] = [];
  for (const path of paths) {
    stats.push(await stat(path));
  }
  return stats;
}

export async function walk(path: string): Promise<string[]> {
  const toGoList: string[] = [path];
  const filePaths: string[] = [];

  while (toGoList.length > 0) {
    const dirPath = toGoList.shift();
    const files = (await readdir(dirPath)).sort();
    for (const file of files) {
      const filePath = join(dirPath, file);
      const s = await stat(filePath);
      if (s.isdir) {
        toGoList.push(filePath);
      } else {
        filePaths.push(filePath);
      }
    }
  }

  return filePaths;
}
