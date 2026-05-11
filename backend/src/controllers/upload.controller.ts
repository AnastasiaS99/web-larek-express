import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { UPLOAD_PATH } from '../config';
import { BadRequestError } from '../errors/bad-request-error';

// Расширение интерфейс Request
declare module 'express' {
  interface Request {
    file?: {
      filename: string;
      originalname: string;
    };
  }
}

const uploadFile = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.file) {
      // В случае отсутствия файла - ошибку и возвращение
      return next(new BadRequestError('Файл обязателен для загрузки.'));
    }

    // Относительный путь для клиента
    const relativePath = path.posix.join('/', UPLOAD_PATH, req.file.filename);

    // Отправляем ответ
    res.status(201).json({
      fileName: relativePath,
      originalName: req.file.originalname,
    });

  } catch (err) {
    // Обработка ошибок
    next(err);
  }
};

export default uploadFile;