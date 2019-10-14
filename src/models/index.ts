export enum YoutubeStage {
  ready = 0,
  download = 1,
  encode = 2,
  success = 3,
}

export interface Subtitle {
  language: string;
  path: string;
}

export interface File {
  path: string;
  name: string;
  isdir: boolean;
  size: number;
}

export interface Stat {
  size: number;
  isDirectory: boolean;
  isFile: boolean;
}