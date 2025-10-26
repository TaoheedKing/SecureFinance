import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
