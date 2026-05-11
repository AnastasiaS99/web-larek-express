import { Router } from "express";
import fileMiddleware from "../middlewares/file";
import uploadFile from "../controllers/upload.controller";
import auth from "../middlewares/auth";

// Создание экземпляр роутера Express
const router = Router();
router.post("/", auth, fileMiddleware.single("file"), uploadFile);

// Экспорт класса
export default router;
