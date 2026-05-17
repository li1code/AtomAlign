import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'superSecretKey';

export const generateToken = (payload: { userId: string; role: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch (error) {
    return null;
  }
};
