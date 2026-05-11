import { ErrorRequestHandler } from 'express';
import { Error as MongooseError } from 'mongoose';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';

// Расширение стандартного error
type HttpError = Error & { statusCode?: number };

// Основной middleware
const errorHandler: ErrorRequestHandler = (err: any, _req, res, _next) => {
  // Получение headers из запроса
  const authHeader = _req.headers['authorization'];
  let token;

  // Проверка наличия токена
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Получение токена
    token = authHeader.substring(7);
  }

  // Токен
  console.log('Полученный токен:', token);

  let normalizedError: HttpError;

  // Обработка ошибок, связанных с валидацией в Mongoose
  if (err instanceof MongooseError.ValidationError) {
    // Создаём ошибку BadRequestError с сообщением из ошибки Mongoose
    normalizedError = new BadRequestError(err.message);
  }
  // Обработка ошибок неправильного типа данных (CastError) в Mongoose
  else if (err instanceof MongooseError.CastError) {
    normalizedError = new BadRequestError(err.message);
  }
  // Обработка ошибки дублирования записи (например, уникальность поля)
  else if (
    (err.code && err.code === 11000) || // Ошибка кода базы данных MongoDB о дубле
    (err.message && typeof err.message === 'string' && err.message.includes('E11000')) // строка сообщения об ошибке дубля
  ) {
    // Создание ошибки ConflictError
    normalizedError = new ConflictError('Product title must be unique');
  }
  // Обработка ошибок
  else if (err && (err.statusCode || err.message)) {
    // Предполагается, что это уже корректная ошибка с кодом и сообщением
    normalizedError = err as HttpError;
  }
  // Обработка всех остальных ошибок
  else {
    console.error('Необработанная ошибка:', err);
    // Создаём новую ошибку с сообщением о проблеме на сервере
    normalizedError = new Error('Проблема сервера');
    // Устанавливаем статус кода 500 (Internal Server Error)
    normalizedError.statusCode = 500;
  }

  // Определение HTTP статус
  const statusCode = normalizedError.statusCode ?? 500;

  // Отправка ответа клиенту
  res.status(statusCode).send({
    // При 500 статусе — стандартное сообщение, иначе — сообщение ошибки
    message: statusCode === 500 ? 'Internal server error' : normalizedError.message,
  });
};

// Экспорт класса
export default errorHandler;