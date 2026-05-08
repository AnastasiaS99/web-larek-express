import { ErrorRequestHandler } from 'express';
import { Error as MongooseError } from 'mongoose';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';

type HttpError = Error & { statusCode?: number };

const errorHandler: ErrorRequestHandler = (err: any, _req, res, _next) => {
  // Получение токена из заголовка
  const authHeader = _req.headers['authorization'];
  let token;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // Отрезаем 'Bearer '
  }

  // Можно логировать токен или использовать его по необходимости
  console.log('Полученный токен:', token);

  let normalizedError: HttpError;

  // Обработка ошибок Mongoose ValidationError
  if (err instanceof MongooseError.ValidationError) {
    normalizedError = new BadRequestError(err.message);
  }
  // Обработка ошибок Mongoose CastError
  else if (err instanceof MongooseError.CastError) {
    normalizedError = new BadRequestError(err.message);
  }
  // Обработка ошибок дублирования (уникальности)
  else if (
    (err.code && err.code === 11000) ||
    (err.message && typeof err.message === 'string' && err.message.includes('E11000'))
  ) {
    normalizedError = new ConflictError('Product title must be unique');
  }
  // Обработка ошибок, которые могут прийти как plain объекты
  else if (err && (err.statusCode || err.message)) {
    normalizedError = err as HttpError;
  }
  // Неизвестные ошибки
  else {
    console.error('Необработанная ошибка:', err);
    normalizedError = new Error('Проблема сервера');
    normalizedError.statusCode = 500;
  }

  // Определение статуса
  const statusCode = normalizedError.statusCode ?? 500;

  // Отправка ответа клиенту
  res.status(statusCode).send({
    message: statusCode === 500 ? 'Internal server error' : normalizedError.message,
  });
};

export default errorHandler;