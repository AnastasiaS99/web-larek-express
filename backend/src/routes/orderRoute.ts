import { Router } from 'express';
import createOrder from '../controllers/order.controller';
import { OrderValidation} from '../middlewares/Validation';

const router = Router();

router.post('/', OrderValidation, createOrder);

export default router;
