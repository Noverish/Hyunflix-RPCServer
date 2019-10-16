import * as fs from 'fs';
import { join, basename } from 'path';

import { Stat } from '@src/models';
import { ARCHIVE_PATH } from '@src/config';
const fsPromises = fs.promises;

export async function readdir(path: string): Promise<string[]> {
  const realPath = join(ARCHIVE_PATH, path);
  return await fsPromises.readdir(realPath);
}

export async function readdirWithFileTypes(path: string): Promise<fs.Dirent[]> {
  const realPath = join(ARCHIVE_PATH, path);
  return await fsPromises.readdir(realPath, { withFileTypes: true });
}

export async function stat(path: string): Promise<Stat> {
  const realPath = join(ARCHIVE_PATH, path);
  const stat = await fsPromises.stat(realPath);
  return {
    path,
    name: basename(path),
    size: stat.size,
    isdir: stat.isDirectory(),
  }
}

export async function access(path: string): Promise<string | null> {
  const realPath = join(ARCHIVE_PATH, path);
  try {
    fsPromises.access(realPath);
    return null;
  } catch (err) {
    return err.message;
  }
}

export async function readdirStat(path: string): Promise<Stat[]> {
  const files: fs.Dirent[] = await readdirWithFileTypes(path);
  const results: Stat[] = [];

  for (const f of files) {
    const filePath = join(path, f.name);

    if (f.isDirectory()) {
      results.push({
        isdir: true,
        path: filePath,
        name: f.name,
        size: 0,
      });
    } else {
      results.push(await stat(filePath));
    }
  }

  return results;
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
