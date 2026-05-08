import { RequestHandler } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

type CreateOrderInfo = {
  payment: 'card' | 'online' | 'cash';
  email: string;
  phone: string;
  address: string;
  total: number | string;  // допускается, поскольку вы делаете проверку
  items: string[];         // список ID товаров
};

const createOrder: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as CreateOrderInfo;
    const { items } = body;

    // Обработка total: допускается строка, превращаем в число
    const totalNum = typeof body.total === 'string' ? Number(body.total) : body.total;

    if (!Number.isFinite(totalNum)) {
      throw new BadRequestError('Неверное значение общей суммы');
    }

    // Убираем возможные дубли
    const uniqueItemIds = Array.from(new Set(items));

    // Получаем товары из базы
    const products = await Product.find({ _id: { $in: uniqueItemIds } }).lean();

    if (products.length !== uniqueItemIds.length) {
      throw new BadRequestError('Некоторые товары не найдены');
    }

    // Создаем карту цен
    const priceById = new Map(
      products.map((p) => [p._id.toString(), p.price]),
    );

    // Суммируем цены товаров, проверяем наличие каждого ID
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

    // Проверяем сумму
    if (calculatedSum !== totalNum) {
      throw new BadRequestError('Сумма не совпадает с общей суммой товаров');
    }

    // Создаем заказ (или просто возвращаем подтверждение)
    res.status(200).send({
      id: faker.string.uuid(),
      total: totalNum,
    });
  } catch (err) {
    next(err);
  }
};

export default createOrder;