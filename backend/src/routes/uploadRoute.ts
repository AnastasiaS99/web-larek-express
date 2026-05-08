import { Router } from 'express';
import fileMiddleware from '../middlewares/file';
import uploadFile from '../controllers/upload.controller';
import auth from '../middlewares/auth';

const router = Router();

router.post('/', auth, fileMiddleware.single('file'), uploadFile);

export default router;
