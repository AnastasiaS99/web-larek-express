import { Request, Response, NextFunction } from "express";
import { Error as MongooseError } from "mongoose";
import path from "path";
import fs from "fs/promises";
import Product from "../models/product";
import { BadRequestError } from "../errors/bad-request-error";
import { ConflictError } from "../errors/conflict-error";
import { NotFoundError } from "../errors/not-found-error";
import { UPLOAD_PATH, UPLOAD_PATH_TEMP } from "../config";

// Помещение файла из временной папки
const moveFromTemp = async (fileName: string) => {
  const filename = path.basename(fileName);
  const tempPath = path.join(
    __dirname,
    "../public",
    UPLOAD_PATH_TEMP,
    filename,
  );
  const finalPath = path.join(__dirname, "../public", UPLOAD_PATH, filename);

  try {
    // Проверка существование файла и перемещение
    await fs.access(tempPath);
    await fs.rename(tempPath, finalPath);
  } catch (err) {
    // В случае ошибки
    console.error(`Ошибка перемещения файла: ${err}`);
    throw new BadRequestError("Файл не найден или его перемещение невозможно");
  }
};

// Получение списка товаров
export const getProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await Product.find({});
    return res.json({ items: products, total: products.length });
  } catch (error) {
    return next(error);
  }
};

// Создание нового продукта
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, image, category, description, price } = req.body;

    // Обработка изображения
    if (image?.fileName) {
      await moveFromTemp(image.fileName);
    }

    const product = await Product.create({
      title,
      image,
      category,
      description,
      price,
    });
    return res.status(201).json(product);
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    if (error instanceof Error && error.message.includes("E11000")) {
      return next(new ConflictError("Товар с таким названием уже существует"));
    }
    return next(error);
  }
};

// Обновление продукта
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const { title, image, category, description, price } = req.body;

    const updates: any = {};

    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;

    // Обработка изображения
    if (image?.fileName) {
      await moveFromTemp(image.fileName);
      // Можно реализовать удаление старого файла, если нужна такая логика
      updates.image = image; // предполагается, что image содержит fileName и нужные данные
    }

    const product = await Product.findByIdAndUpdate(productId, updates, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return next(new NotFoundError("Товар не найден"));
    }
    return res.json(product);
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    if (error instanceof Error && error.message.includes("E11000")) {
      return next(new ConflictError("Товар с таким названием уже существует"));
    }
    return next(error);
  }
};

// Удаление товара
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return next(new NotFoundError("Товар не найден"));
    }

    return res.json(product);
  } catch (error) {
    return next(error);
  }
};
