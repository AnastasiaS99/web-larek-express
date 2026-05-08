import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { UPLOAD_PATH } from '../config';
import BadRequestError from '../errors/bad-request-error';

// Расширяем интерфейс Request для поддержки req.file (например, если используешь multer)
declare module 'express' {
  interface Request {
    file?: {
      filename: string;
      originalname: string;
    };
  }
}

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      // Явно прерываем выполнение при ошибке
      return next(new BadRequestError('Файл обязателен для загрузки.'));
    }

    // Формируем относительный путь для клиента
    const relativePath = path.posix.join('/', UPLOAD_PATH, req.file.filename);

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