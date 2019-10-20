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

export interface Stat {
  path: string;
  name: string;
  size: number;
  isdir: boolean;
}

export interface Auth {
  id: number;
  token: string;
  authority: string[];
  allowedPaths: string[];
}