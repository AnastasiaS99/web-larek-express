import { Router } from 'express';
import productRoutes from './productRoute';
import orderRoutes from './orderRoute';
import authRoutes from './authRoute';
import uploadRoutes from './uploadRoute';

const router = Router();

router.use('/product', productRoutes);
router.use('/order', orderRoutes);
router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);

export default router;

