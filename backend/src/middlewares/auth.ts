import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import UnauthorizedError from '../errors/unauthorized-error';
import { AUTH_ACCESS_TOKEN_SECRET } from '../config';

// Расширенный интерфейс Express.Request
declare global {
  namespace Express {
    interface Request {
      user?: { _id: string };
    }
  }
}

// Проверка авторизации по JWT-токену
const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  // Достаём заголовок authorization из запроса
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация (токен отсутствует)'));
  }

  // Получение токена
  const token = authorization.slice(7).trim();

  try {

    const payload = jwt.verify(token, AUTH_ACCESS_TOKEN_SECRET) as JwtPayload;

    // Проверка на существование _id
    if (!payload._id || typeof payload._id !== 'string') {
      return next(new UnauthorizedError('Некорректный токен'));
    }

    // Сохранение _id в запросе
    req.user = { _id: payload._id };
    return next(); // авторизация успешна, идём дальше
  } catch (err) {
    // Если токен истёк
    if (err instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Токен истёк'));
    }
    // Если токен некорректный
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError('Некорректный токен'));
    }
    // В случае остальных ошибок
    return next(new UnauthorizedError('Необходима авторизация'));
  }
};

// Экспорт класса
export default authMiddleware;