import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export async function authMiddleware(req:Request, res:Response, next:NextFunction) {
  try {
    const token: string = req.cookies.token;
    if (token) {
      jwt.verify(token, process.env.USER_JWT_SECRET??"secret", (err, decoded) => {
        if (err) {
          res.status(403).json({ error: err.message });
        } else {
            //@ts-ignore
          req.decodedUser = decoded ;
          next();
        }
      });
    } else {
      res.status(403).json({ message: 'No token provided' });
    }
  } catch (error: any) {
    console.log(error);
  }
}