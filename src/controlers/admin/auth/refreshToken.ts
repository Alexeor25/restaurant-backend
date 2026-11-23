import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';


export const refreshToken = (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.json({ accessToken: null });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.REFRESH_SECRET as string
    ) as { id: number };

    const newAccessToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    return res.json({ accessToken: newAccessToken });
  } catch {
    return res.sendStatus(403);
  }
};
