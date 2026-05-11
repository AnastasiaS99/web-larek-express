import { RequestHandler } from "express";
import { faker } from "@faker-js/faker";
import Product from "../models/product";
import { BadRequestError } from "../errors/bad-request-error";

// Интерфейс заказа
type CreateOrderInfo = {
  payment: "card" | "online" | "cash";
  email: string;
  phone: string;
  address: string;
  total: number | string;
  items: string[];
};

const createOrder: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as CreateOrderInfo;
    const { items } = body;

    // Обработка total
    const totalNum =
      typeof body.total === "string" ? Number(body.total) : body.total;

    if (!Number.isFinite(totalNum)) {
      throw new BadRequestError("Неверное значение общей суммы");
    }

    // Работа с ненужными дулями
    const uniqueItemIds = Array.from(new Set(items));

    // Получение товаров из базы
    const products = await Product.find({ _id: { $in: uniqueItemIds } }).lean();

    if (products.length !== uniqueItemIds.length) {
      throw new BadRequestError("Некоторые товары не найдены");
    }

    // Создание карты цен
    const priceById = new Map(products.map((p) => [p._id.toString(), p.price]));

    // Сумма цены товаров (каждый товар по ID)
    const calculatedSum = items.reduce((acc, id) => {
      const price = priceById.get(id);
      if (price === undefined) {
        throw new BadRequestError(`Товар с ID ${id} не найден`);
      }
      if (price === null || price === undefined) {
        throw new BadRequestError(`Товар с ID ${id} недоступен для продажи`);
      }
      return acc + price;
    }, 0);

    // Проверка суммы
    if (calculatedSum !== totalNum) {
      throw new BadRequestError("Сумма не совпадает с общей суммой товаров");
    }

    // Создание заказа
    res.status(200).send({
      id: faker.string.uuid(),
      total: totalNum,
    });
  } catch (err) {
    next(err);
  }
};

export default createOrder;
