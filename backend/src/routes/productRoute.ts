import { Router } from "express";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import {
  ProductValidation,
  ProductIdValidation,
  ProductUpdateValidation,
} from "../middlewares/Validation";
import authMiddleware from "../middlewares/auth";

// Создание экземпляра роутера
const router = Router();

// GET / — Получение списка продуктов
router.get("/", getProducts);

// POST / — Создание нового продукта
router.post("/", authMiddleware, ProductValidation, createProduct);

// PATCH /:productId — Обновление продукта по ID
router.patch(
  "/:productId",
  authMiddleware,
  ProductIdValidation,
  ProductUpdateValidation,
  updateProduct,
);

// DELETE /:productId — Удаление продукта по ID
router.delete(
  "/:productId",
  authMiddleware,
  ProductIdValidation,
  deleteProduct,
);

// Экспорт класса
export default router;
