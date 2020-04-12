import * as fs from 'fs';
import { join, basename, dirname } from 'path';

import { Stat } from '@src/models';
import { ARCHIVE_PATH } from '@src/config';

const fsPromises = fs.promises;

export function readdir(path: string): Promise<string[]>;
export function readdir(path: string, options: { withFileTypes: true }): Promise<fs.Dirent[]>;
export function readdir(
  path: string,
  options?: { withFileTypes: true },
): Promise<string[] | fs.Dirent[]> {
  const realPath = join(ARCHIVE_PATH, path);
  return fsPromises.readdir(realPath, options);
}

export async function rename(from: string, to: string): Promise<void> {
  const realFrom = join(ARCHIVE_PATH, from);
  const realTo = join(ARCHIVE_PATH, to);

  try {
    await fsPromises.access(dirname(realTo));
  } catch (error) {
    await fsPromises.mkdir(dirname(realTo), { recursive: true });
  }

  await fsPromises.rename(realFrom, realTo);
}

export function unlink(path: string): Promise<void> {
  const realPath = join(ARCHIVE_PATH, path);
  return fsPromises.unlink(realPath);
}

export async function unlinkBulk(paths: string[]): Promise<void> {
  await Promise.all(paths.map(unlink));
}

export async function stat(path: string): Promise<Stat> {
  const realPath = join(ARCHIVE_PATH, path);
  const s = await fsPromises.stat(realPath);
  return {
    path,
    name: basename(path),
    size: s.size,
    isdir: s.isDirectory(),
  };
}

export function statBulk(paths: string[]): Promise<Stat[]> {
  return Promise.all(paths.map(stat));
}

export async function walk(path: string): Promise<string[]> {
  const promises: Promise<string[]>[] = (await readdir(path, { withFileTypes: true }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((d): Promise<string[]> => {
      if (d.isFile()) {
        return Promise.resolve([join(path, d.name)]);
      } if (d.isDirectory()) {
        return walk(join(path, d.name));
      }
      return Promise.resolve([]);
    });

  return (await Promise.all(promises))
    .reduce((acc: string[], curr: string[]) => acc.concat(curr), []);
}

export async function walkDir(path: string): Promise<string[]> {
  const promises: Promise<string[]>[] = (await readdir(path, { withFileTypes: true }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((d): Promise<string[]> => {
      if (d.isDirectory()) {
        return walkDir(join(path, d.name));
      }
      return Promise.resolve([]);
    });

  const result = (await Promise.all(promises))
    .reduce((acc: string[], curr: string[]) => acc.concat(curr), []);

  if (result.length === 0) {
    return [path];
  }
  return result;
}
