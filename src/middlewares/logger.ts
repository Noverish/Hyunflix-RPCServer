import * as morgan from 'morgan';
import { dateToString } from '@src/utils';

morgan.token('remote-addr', (req, res) => {
  const ip = req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress) || undefined;
  if (ip && typeof ip === 'string' && ip.split(':').length === 4) {
    return ip.split(':')[3];
  }

  return ip;
});

morgan.token('date', (req, res) => {
  return dateToString(new Date());
});

const consoleFormat = '[:date] :remote-addr - :method :status :response-time ms ":url"';
export const consoleLogger = morgan(consoleFormat);
