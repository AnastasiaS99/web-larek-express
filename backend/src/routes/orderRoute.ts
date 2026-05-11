import { Router } from "express";
import createOrder from "../controllers/order.controller";
import { OrderValidation } from "../middlewares/Validation";

// Создаём роутер Express для маршрутов заказов
const router = Router();

// Маршрут POST /
router.post("/", OrderValidation, createOrder);

// Экспортируем класса
export default router;
