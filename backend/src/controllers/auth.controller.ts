import { Request, Response, NextFunction, CookieOptions } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ms from "ms";
import { Error as MongooseError } from "mongoose";
import User from "../models/user";
import { BadRequestError } from "../errors/bad-request-error";
import { ConflictError } from "../errors/conflict-error";
import { NotFoundError } from "../errors/not-found-error";
import { UnauthorizedError } from "../errors/unauthorized-error";
import {
  AUTH_ACCESS_TOKEN_SECRET,
  AUTH_REFRESH_TOKEN_SECRET,
  AUTH_ACCESS_TOKEN_EXPIRY,
  AUTH_REFRESH_TOKEN_EXPIRY,
} from "../config";

const ACCESS_SECRET = AUTH_ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = AUTH_REFRESH_TOKEN_SECRET;
const ACCESS_EXPIRY = AUTH_ACCESS_TOKEN_EXPIRY as ms.StringValue;
const REFRESH_EXPIRY = AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue;

const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production", // В проде безопаснее true
  maxAge: ms(REFRESH_EXPIRY),
  path: "/",
};

// Создаем новые access и refresh токены
const generateTokens = (_id: string) => ({
  accessToken: jwt.sign({ _id }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY }),
  refreshToken: jwt.sign({ _id }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
  }),
});

// Получение нового пользователя через refresh токен, ошибка в случае проблемы
const getUserByRefreshToken = async (refreshToken: string) => {
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as { _id: string };
    const user = await User.findById(payload._id).select("+tokens");
    if (!user) throw new NotFoundError("Пользователь не найден");
    return { user, payload };
  } catch {
    throw new UnauthorizedError("Невалидный токен");
  }
};

// Регистрация нового пользователя
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new BadRequestError("Все поля обязательны"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const { accessToken, refreshToken } = generateTokens(String(user._id));
    user.tokens.push({ token: refreshToken });
    await user.save();

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    return res.status(201).send({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken,
    });
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    if (error instanceof Error && error.message.includes("E11000")) {
      return next(
        new ConflictError("Пользователь с таким email уже существует"),
      );
    }
    return next(error);
  }
};

// Вход пользователя
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new BadRequestError("Все поля обязательны"));
    }

    const user = await User.findOne({ email }).select("+password +tokens");

    if (!user) return next(new UnauthorizedError("Неверный email или пароль"));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return next(new UnauthorizedError("Неверный email или пароль"));

    const { accessToken, refreshToken } = generateTokens(String(user._id));
    user.tokens.push({ token: refreshToken });
    if (user.tokens.length > 10) user.tokens = user.tokens.slice(-10);
    await user.save();

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    return res.send({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

// Выход пользователя
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return next(new UnauthorizedError("Токен не передан"));
    }

    const { user } = await getUserByRefreshToken(refreshToken);

    user.tokens = user.tokens.filter((t) => t.token !== refreshToken);
    await user.save();

    res.clearCookie("refreshToken", { path: "/" });
    return res.send({ success: true });
  } catch (error) {
    return next(error);
  }
};

// Обновление access токена
export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return next(new UnauthorizedError("Токен не передан"));
    }

    const { user } = await getUserByRefreshToken(refreshToken);

    const tokenExists = user.tokens.some((t) => t.token === refreshToken);
    if (!tokenExists) {
      throw new UnauthorizedError("Токен недействителен или истёк");
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      String(user._id),
    );
    user.tokens = user.tokens.filter((t) => t.token !== refreshToken);
    user.tokens.push({ token: newRefreshToken });
    if (user.tokens.length > 10) user.tokens = user.tokens.slice(-10);
    await user.save();

    res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);
    return res.send({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

// Получение данных текущего пользователя
export const currentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return next(new UnauthorizedError("Пользователь не авторизован"));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new NotFoundError("Пользователь не найден"));
    }

    return res.send({
      user: { email: user.email, name: user.name },
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};
