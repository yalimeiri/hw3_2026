import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthTokenPayload {
  id: string;
  username: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthTokenPayload;
  }
}

const auth = (req: Request, res: Response, next: NextFunction): void => {
  const authorization = req.get('authorization');

  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    res.status(401).json({ error: 'token missing' });
    return;
  }

  const token = authorization.substring(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in .env file');
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthTokenPayload;
    req.user = { id: decoded.id, username: decoded.username };
    next();
  } catch {
    res.status(401).json({ error: 'token invalid or expired' });
  }
};

export default auth;
