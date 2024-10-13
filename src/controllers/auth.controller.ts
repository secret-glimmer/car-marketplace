import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import { authService } from "@/services";
import httpStatus from "http-status";
import { CustomError } from "@/errors";
import { MESSAGES } from "@/consts";
import { JWT_TOKEN } from "@/config";
import { errorHandlerWrapper } from "@/utils";

export const registerValidator = () => {
  return [
    body("username").exists().withMessage(MESSAGES.USERNAME_REQUIRED),
    body("password").exists().withMessage(MESSAGES.PASSWORD_REQUIRED),
  ];
};

export const loginValidator = () => {
  return [
    body("username").exists().withMessage(MESSAGES.USERNAME_REQUIRED),
    body("password").exists().withMessage(MESSAGES.PASSWORD_REQUIRED),
  ];
};

const registerHandler = async (req: Request, res: Response) => {
  const { username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const checkDuplication = await authService.getUser(username);
  if (checkDuplication) {
    throw new CustomError(MESSAGES.USER_DUPLICATED, httpStatus.CONFLICT);
  }
  const user = await authService.register({
    username,
    password: hashedPassword,
    role,
  });

  res.status(httpStatus.CREATED).json({ user });
};

const loginHandler = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await authService.getUser(username);
  if (!user) {
    throw new CustomError(
      MESSAGES.INVALID_CREDENTIALS,
      httpStatus.UNAUTHORIZED
    );
  }
  if (!(await bcrypt.compare(password, user.password))) {
    throw new CustomError(
      MESSAGES.INVALID_CREDENTIALS,
      httpStatus.UNAUTHORIZED
    );
  }
  const token = jwt.sign(
    { uuid: user.uuid, username: user.username, role: user.role },
    JWT_TOKEN
  );
  res.status(httpStatus.OK).json({ message: MESSAGES.LOGIN_SUCCESS, token });
};

export const register = errorHandlerWrapper(registerHandler);
export const login = errorHandlerWrapper(loginHandler);
