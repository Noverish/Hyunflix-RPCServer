import * as request from 'request';

import { YOUTUBE_HOST } from '@src/config';

function send(url, method, payload): Promise<request.Response> {
  return new Promise((resolve, reject) => {
    const options = {
      url,
      method,
      headers: { authorization: 'Bearer youtube' },
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

export async function musicEncodeDone(path: string, duration: number) {
  const url = `${YOUTUBE_HOST}/encoding-done`;
  const method = `POST`;
  const payload = { path, duration };
  
  await send(url, method, payload);
}