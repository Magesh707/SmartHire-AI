import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'RECRUITER';
    name: string;
  };
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Authorization: Bearer <token>

    if (!token) {
      return res.status(401).json({ error: 'Access token missing or malformed' });
    }

    try {
      const secret = process.env.JWT_SECRET || 'smarthire_jwt_secret_key_12345_super_secure_change_me_in_production';
      const decoded = jwt.verify(token, secret) as { id: string; email: string; role: 'ADMIN' | 'RECRUITER'; name: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, name: true }
      });

      if (!user) {
        return res.status(401).json({ error: 'User associated with this token no longer exists' });
      }

      req.user = user as { id: string; email: string; role: 'ADMIN' | 'RECRUITER'; name: string };
      next();
    } catch (err: any) {
      console.error('JWT Verification Error:', err.message);
      return res.status(403).json({ error: 'Invalid or expired access token' });
    }
  } else {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }
};

export const requireRole = (roles: ('ADMIN' | 'RECRUITER')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User is not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied. Insufficient role permissions.' });
    }

    next();
  };
};
