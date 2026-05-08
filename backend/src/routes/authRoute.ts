import { Router } from 'express';
import {
  login, register, logout, refreshAccessToken, currentUser,
} from '../controllers/auth.controller';
import authMiddleware from '../middlewares/auth';
import { LoginValidation, RegistrationValidation } from '../middlewares/Validation';

const router = Router();

router.post('/login', LoginValidation, login);
router.post('/register', RegistrationValidation, register);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', authMiddleware, currentUser);

export default router;

