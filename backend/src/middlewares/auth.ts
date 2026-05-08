import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import UnauthorizedError from '../errors/unauthorized-error';
import { AUTH_ACCESS_TOKEN_SECRET } from '../config';

declare global {
  namespace Express {
    interface Request {
      user?: { _id: string };
    }
  }
}

const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация (токен отсутствует)'));
  }

  const token = authorization.slice(7).trim();

  try {
    // verify возвращает JwtPayload или выбрасывает ошибку
    const payload = jwt.verify(token, AUTH_ACCESS_TOKEN_SECRET) as JwtPayload;

    // Проверка наличия _id в payload
    if (!payload._id || typeof payload._id !== 'string') {
      return next(new UnauthorizedError('Некорректный токен'));
    }

    req.user = { _id: payload._id };
    return next();
  } catch (err) {
    // Обработка ошибок JWT
    if (err instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Токен истёк'));
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError('Некорректный токен'));
    }
    // Другие ошибки
    return next(new UnauthorizedError('Необходима авторизация'));
  }
};

export default authMiddleware;