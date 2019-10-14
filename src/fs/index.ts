import * as fs from 'fs';
import { join } from 'path';

import { File, Stat } from '@src/models';
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

export async function lstat(path: string): Promise<Stat> {
  const realPath = join(ARCHIVE_PATH, path);
  const stat = await fsPromises.lstat(realPath);
  return {
    size: stat.size,
    isDirectory: stat.isDirectory(),
    isFile: stat.isFile(),
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

export async function readdirDetail(path: string): Promise<File[]> {
  const files: fs.Dirent[] = await readdirWithFileTypes(path);
  const results: File[] = [];

  for (const f of files) {
    const isdir = f.isDirectory();
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
      const stat = await lstat(filePath);

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

export async function walk(path: string): Promise<string[]> {
  const toGoList: string[] = [path];
  const filePaths: string[] = [];

  while (toGoList.length > 0) {
    const dirPath = toGoList.shift();
    const files = (await readdir(dirPath)).sort();
    for (const file of files) {
      const filePath = join(dirPath, file);
      const stat = await lstat(filePath);
      if (stat.isDirectory) {
        toGoList.push(filePath);
      } else if (stat.isFile) {
        filePaths.push(filePath);
      }
    }
  }

  return filePaths;
}