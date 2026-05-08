import { Router } from 'express';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
} from '../controllers/product.controller';
import { ProductValidation, ProductIdValidation, ProductUpdateValidation } from '../middlewares/Validation';
import authMiddleware from '../middlewares/auth';

const router = Router();

router.get('/', getProducts);
router.post('/', authMiddleware, ProductValidation, createProduct);
router.patch('/:productId', authMiddleware, ProductIdValidation, ProductUpdateValidation, updateProduct);
router.delete('/:productId', authMiddleware, ProductIdValidation, deleteProduct);

export default router;
