import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import cookieParser from 'cookie-parser';
import { requestLogger, errorLogger } from './middlewares/logger';
import errorHandler from './middlewares/errorHandler';
import { PORT, DB_ADDRESS} from './config'
import NotFoundError from './errors/not-found-error'
import rateLimit from 'express-rate-limit';
import { errors } from 'celebrate';
import productRouter from './routes/productRoute';
import orderRouter from './routes/orderRoute';
import authRouter from './routes/authRoute';
import uploadRouter from './routes/uploadRoute';
import { ORIGIN_ALLOW } from './config';

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({
  origin: ORIGIN_ALLOW,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(limiter);

// Логгер запросов
app.use(requestLogger);

// Раздача статических файлов
app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use('/auth', authRouter);
app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/upload', uploadRouter);
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError('Маршрут не найден'));
});
// Логгер ошибок
app.use(errorLogger);

// Централизованный обработчик ошибок
app.use(errorHandler);
app.use(errors());

// Подключение к MongoDB и запуск сервера
mongoose.connect(DB_ADDRESS)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Удалось подключиться к MongoDB');
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Сервер запущен по адресу http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Не удалось подключиться к MongoDB:', error);
    process.exit(1);
  });