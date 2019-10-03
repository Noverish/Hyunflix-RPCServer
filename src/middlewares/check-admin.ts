import { Request, Response, NextFunction } from 'express';

export function checkAdmin(req: Request, res: Response, next: NextFunction) {
  const authority: string[] = req['authority'];

  if (authority.includes('admin')) {
    next();
  } else {
    res.status(403);
    res.json({ msg: 'No Authority' });
  }
}

export function checkBackend(req: Request, res: Response, next: NextFunction) {
  const authority: string[] = req['authority'];

  if (authority.includes('backend')) {
    next();
  } else {
    res.status(403);
    res.json({ msg: 'No Authority' });
  }
}
