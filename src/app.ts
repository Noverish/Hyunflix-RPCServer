import * as express from 'express';
import * as http from 'http';
import * as cors from 'cors';
import { createConnection } from 'typeorm';

import { PORT, FFMPEG_SOCKET_PATH, YOUTUBE_SOCKET_PATH } from '@src/config';
import { createSocket } from '@src/utils/socket';
import validateHeader from '@src/middlewares/validate-header';
import { consoleLogger } from '@src/middlewares/logger';
import { workNotDone } from '@src/worker/ffmpeg';
import routes from '@src/routes';

const app = express();

app.set('port', PORT);

app.use(cors());
app.use(express.json());

app.use(consoleLogger);

app.use(validateHeader);
app.use('/', routes);

app.use((req, res, next) => {
  res.status(404);
  res.json({ msg: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500);
  res.json({ msg: err.stack });
});

export const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`* FFMpeg Server Started at ${PORT}`);
  createConnection()
    .then(() => {
      createSocket(FFMPEG_SOCKET_PATH);
      createSocket(YOUTUBE_SOCKET_PATH);
      workNotDone();
    })
    .catch(console.error);
});