import path from "path";
import multer from "multer";
import { UPLOAD_PATH_TEMP } from "../config";

// Получение абсолютный путь к временной папке для загрузки файлов
const tempDir = path.resolve(process.cwd(), "src", "public", UPLOAD_PATH_TEMP);

// Настройка хранилища файлов
const storage = multer.diskStorage({
  // Место сохранение файла
  destination: (_req, _file, cb) => cb(null, tempDir),
  // Название файла
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Фильтрация файлов по mime-типу
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowed = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/gif",
    "image/svg+xml",
  ];
  if (!allowed.includes(file.mimetype)) {
    // В случае ошибки
    console.warn(`Файл отклонён: неподдерживаемый тип ${file.mimetype}`);
    // Передача ошибки
    cb(
      new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Unsupported file type"),
    );
    return;
  }
  cb(null, true);
};

// Конфигурирация middleware
const fileMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

// Экспорт класса
export default fileMiddleware;
