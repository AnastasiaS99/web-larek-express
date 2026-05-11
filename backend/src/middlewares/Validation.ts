import { celebrate, Joi, Segments } from 'celebrate';

// Общие схемы для повторяющихся типов (email, id, phone, password, address)
const commonStringSchema = (min = 2, max = 30) => Joi.string().min(min).max(max).trim();

const emailSchema = Joi.string().email().trim().required();
const passwordSchema = Joi.string().min(6).required();
const idSchema = Joi.string().hex().length(24);
const phoneSchema = Joi.string()
  .pattern(/^\+?\d{10,15}$/)
  .required();
const addressSchema = Joi.string().min(5).max(100).trim()
  .required();

const fileSchema = Joi.object({
  fileName: Joi.string()
    .required(),
  originalName: Joi.string()
    .required(),
});

// =================== Валидации ===================

// Валидация данных регистрации пользователя
export const RegistrationValidation = celebrate({
  [Segments.BODY]: Joi.object({
    name: commonStringSchema(2, 30).required(),
    email: emailSchema,
    password: passwordSchema,
  }),
});

// Валидация данных авторизации пользователя
export const LoginValidation = celebrate({
  [Segments.BODY]: Joi.object({
    email: emailSchema,
    password: passwordSchema,
  }),
});

// Валидация id продукта в параметрах (ObjectId)
export const ProductIdValidation = celebrate({
  [Segments.PARAMS]: Joi.object({
    productId: idSchema.required(),
  }),
});

// Валидация создания продукта
export const ProductValidation = celebrate({
  [Segments.BODY]: Joi.object({
    title: commonStringSchema(2, 30).required(),
    image: fileSchema.required(),
    category: commonStringSchema(2, 30).required(),
    description: Joi.string().min(2).max(300).optional(),
    price: Joi.number().min(0).allow(null).optional(),
  }),
});

// Валидация обновления продукта
export const ProductUpdateValidation = celebrate({
  [Segments.BODY]: Joi.object({
    title: commonStringSchema(2, 30),
    image: fileSchema,
    category: commonStringSchema(2, 30),
    description: Joi.string().min(2).max(300).optional(),
    price: Joi.number().min(0).allow(null).optional(),
  }).min(1),
});

// Валидация заказа
export const OrderValidation = celebrate({
  [Segments.BODY]: Joi.object({
    payment: Joi.string().valid('card', 'online', 'cash').required(),
    email: emailSchema,
    phone: phoneSchema,
    address: addressSchema,
    total: Joi.number().min(0).required(),
    items: Joi.array().items(idSchema).min(1).unique()
      .required(),
  }),
});

// ----- Экспорт схем отдельно  -----
export const ValidationSchemas = {
  commonStringSchema,
  emailSchema,
  passwordSchema,
  idSchema,
  phoneSchema,
  addressSchema,
  fileSchema,
};
