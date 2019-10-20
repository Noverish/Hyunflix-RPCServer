import { Request, Response, NextFunction } from 'express';

import { Auth } from '@src/models';

const AUTH_HEADER = 'x-hyunsub-auth'

export default function (req: Request, res: Response, next: NextFunction) {
  const authString: string = (req.headers[AUTH_HEADER] || '').toString();
  
  if (!authString) {
    res.status(401);
    res.json({ msg: 'Unauthorized' });
  } else {
    req['auth'] = JSON.parse(authString);
    next();
  }
}

export function checkUserId(userId: number) {
  return function (req: Request, res: Response, next: NextFunction) {
    const auth: Auth = req['auth'];
    
    if (auth.id !== userId) {
      res.status(403);
      res.json({ msg: 'Forbidden' });
    } else {
      next();
    }
  }
}

export function checkAuthority(authority: string) {
  return function (req: Request, res: Response, next: NextFunction) {
    const auth: Auth = req['auth'];
    
    if (!auth.authority.includes(authority)) {
      res.status(403);
      res.json({ msg: 'Forbidden' });
    } else {
      next();
    }
  }
}