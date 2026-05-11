import { Router } from 'express';
import {
  login, register, logout, refreshAccessToken, currentUser,
} from '../controllers/auth.controller';
import authMiddleware from '../middlewares/auth';
import { LoginValidation, RegistrationValidation } from '../middlewares/Validation';

// Создание новый экземпляр маршрутизатора Express
const router = Router();

// --- Публичные маршруты ---

// Войти в систему (логин)
router.post('/login', LoginValidation, login);

// Регистрация нового пользователя
router.post('/register', RegistrationValidation, register);

// Обновление access-токена по refresh-токену (публичный маршрут)
router.get('/token', refreshAccessToken);

// Выход из системы (logout)
router.get('/logout', logout);

// --- Приватные/Защищённые маршруты ---

// Получиение информации о текущем пользователе
router.get('/user', authMiddleware, currentUser);

// Экспортируем класса
export default router;