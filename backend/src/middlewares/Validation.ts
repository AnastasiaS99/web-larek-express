import { celebrate, Joi, Segments } from 'celebrate';

const commonStringSchema = (min = 2, max = 30) =>
  Joi.string().min(min).max(max).trim();

const fileSchema = Joi.object({
  fileName: Joi.string().required(),
  originalName: Joi.string().required(),
});

export const RegistrationValidation = celebrate({
  [Segments.BODY]: Joi.object({
    name: commonStringSchema(2, 30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});

export const LoginValidation = celebrate({
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});

export const ProductIdValidation = celebrate({
  [Segments.PARAMS]: Joi.object({
    productId: Joi.string().hex().length(24).required(),
  }),
});

export const ProductValidation = celebrate({
  [Segments.BODY]: Joi.object({
    title: commonStringSchema(2, 30).required(),
    image: fileSchema.required(),
    category: commonStringSchema(2, 30).required(),
    description: Joi.string().min(2).max(300).optional(),
    price: Joi.number().min(0).allow(null).optional(),
  }),
});

export const ProductUpdateValidation = celebrate({
  [Segments.BODY]: Joi.object({
    title: commonStringSchema(2, 30),
    image: fileSchema,
    category: commonStringSchema(2, 30),
    description: Joi.string().min(2).max(300).optional(),
    price: Joi.number().min(0).allow(null).optional(),
  }),
});

export const OrderValidation = celebrate({
  [Segments.BODY]: Joi.object({
    payment: Joi.string().valid('card', 'online', 'cash').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?\d{10,15}$/).required(),
    address: Joi.string().min(5).max(100).trim().required(),
    total: Joi.number().min(0).required(),
    items: Joi.array().items(Joi.string().hex().length(24)).min(1).unique().required(),
  }),
});