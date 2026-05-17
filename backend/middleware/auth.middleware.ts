import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import prisma from '../prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    departmentId?: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, role: true, departmentId: true }
  });

  if (!user) {
    res.status(401).json({ message: 'Unauthorized: User not found' });
    return;
  }

  req.user = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId || undefined
  };

  next();
};
