import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import cookieParser from "cookie-parser";
import { requestLogger, errorLogger } from "./middlewares/logger";
import errorHandler from "./middlewares/errorHandler";
import { PORT, DB_ADDRESS } from "./config";
import NotFoundError from "./errors/not-found-error";
import rateLimit from "express-rate-limit";
import { errors } from "celebrate";
import productRouter from "./routes/productRoute";
import orderRouter from "./routes/orderRoute";
import authRouter from "./routes/authRoute";
import uploadRouter from "./routes/uploadRoute";
import { ORIGIN_ALLOW } from "./config";

const app = express();

// Настройка ограничения частоты запросов: не больше 100 запросов за 15 минут с одного IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов
  standardHeaders: true,
  legacyHeaders: false,
});

// Разрешение запросов только от доверенных источников и передача cookies
app.use(
  cors({
    origin: ORIGIN_ALLOW,
    credentials: true,
  }),
);
// Включение парсинг JSON в теле запросов
app.use(express.json());
// Включение парсинг данных из обычных форм
app.use(express.urlencoded({ extended: true }));
// Парсинг cookie заголовков
app.use(cookieParser());
// Включение защита от DDoS запросов
app.use(limiter);

// Логирование всех входящих запросов
app.use(requestLogger);

// Раздача статических файлов из папки public/images по адресу /images
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Подключение роутеров
app.use("/auth", authRouter);
app.use("/product", productRouter);
app.use("/order", orderRouter);
app.use("/upload", uploadRouter);

// В случае ошибки
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError("Маршрут не найден"));
});

// Логирование всех ошибок
app.use(errorLogger);

// Централизованный обработчик ошибок приложения
app.use(errorHandler);
// Обработка ошибок celebrate (валидации схем через Joi)
app.use(errors());

// Подключение к базе данных MongoDB и запуск сервера
mongoose
  .connect(DB_ADDRESS)
  .then(() => {
    // Если подключение успешно — запуск сервера на указанном порту
    console.log("Удалось подключиться к MongoDB");
    app.listen(PORT, () => {
      console.log(`Сервер запущен по адресу http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    // Если не удалось подключиться к Mongo — ошибка и завершение процесса
    console.error("Не удалось подключиться к MongoDB:", error);
    process.exit(1);
  });
