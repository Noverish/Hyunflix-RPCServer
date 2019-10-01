import * as request from 'request';

import { BACKEND_HOST } from '@src/config';

function send(url, method, payload): Promise<request.Response> {
  return new Promise((resolve, reject) => {
    const options = {
      url,
      method,
      json: payload
    };

    request(options, (err: any, res: request.Response, body: any) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(body);
    });
  });
}


export async function addMusic(title: string, path: string, duration: number, youtube: string, tags: string[], authority: string[]) {
  const url = `${BACKEND_HOST}/musics`;
  const method = `POST`;
  const payload = { title, path, duration, youtube, tags, authority };
  
  await send(url, method, payload);
}