import * as request from 'request';

import { FFMPEG_SERVER_KEY } from '@src/credentials';

function send(url, method, payload): Promise<request.Response> {
  return new Promise((resolve, reject) => {
    const options = {
      url,
      method,
      headers: {
        'Authorization': `Bearer ${FFMPEG_SERVER_KEY}`
      },
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
  const url = `http://home.hyunsub.kim:8080/api/musics`;
  const method = `POST`;
  const payload = { title, path, duration, youtube, tags, authority };
  
  await send(url, method, payload);
}