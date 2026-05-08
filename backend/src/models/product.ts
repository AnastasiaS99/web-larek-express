import mongoose, { Schema, Document } from 'mongoose';

export interface IImage {
  fileName: string;
  originalName: string;
}

export interface IProduct extends Document {
  title: string;
  image: IImage;
  category: string;
  description?: string;
  price: number | null;
}

// Константы для категорий
const categories = ['софт-скил', 'хард-скил', 'кнопка', 'дополнительное', 'другое'] as const;
type CategoryType = typeof categories[number];

const imageSchema = new Schema<IImage>({
  fileName: {
    type: String,
    required: [true, 'Поле "fileName" обязательно для заполнения'],
  },
  originalName: {
    type: String,
    required: [true, 'Поле "originalName" обязательно для заполнения'],
  },
});

const productSchema = new Schema<IProduct>({
  title: {
    type: String,
    required: [true, 'Поле "title" должно быть заполнено'],
    unique: true,
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30'],
  },
  image: {
    type: imageSchema,
    required: [true, 'Поле "image" обязательно для заполнения'],
  },
  category: {
    type: String,
    required: [true, 'Поле "category" обязательно для заполнения'],
    enum: {
      values: categories,
      message: 'Недопустимая категория',
    },
  },
  description: {
    type: String,
    maxlength: [1000, 'Максимальная длина описания - 1000 символов'],
  },
  price: {
    type: Number,
    default: null,
    min: [0, 'Цена не может быть <0'],
  },
}, {
  versionKey: false,
  timestamps: true, // добавлено для автоматического учета времени
});

const ProductModel = mongoose.model<IProduct>('product', productSchema);

export default ProductModel;