// POST /api/refresh
import { Request, Response } from 'express';

import jwt from 'jsonwebtoken'
export const refreshToken = (req:Request, res:Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);
  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    const newAccessToken = jwt.sign({ userId: payload.userId }, PRIVATE_KEY, { 
      algorithm: 'RS256', 
      expiresIn: '15m' 
    });
    res.json({ accessToken: newAccessToken });
  } catch (e) {
    res.sendStatus(403);
  }
};
