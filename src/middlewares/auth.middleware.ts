import { Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_TOKEN } from "@/config";
import { MESSAGES } from "@/consts";
import { authService } from "@/services";
import { CustomError } from "@/errors";
import httpStatus from "http-status";

export const authMiddleware = async (
  req: any,
  res: Response,
  next: Function
) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      throw new CustomError(
        MESSAGES.AUTH_TOKEN_REQUIRED,
        httpStatus.UNAUTHORIZED
      );
    }

    const data = jwt.verify(token, JWT_TOKEN);
    const user = await authService.getUser(data.username);

    if (!user) {
      throw new CustomError(MESSAGES.USER_NOT_FOUND, httpStatus.NOT_FOUND);
    }
    req.user = user;

    next();
  } catch (error) {
    res.status(httpStatus.UNAUTHORIZED).json({
      message: MESSAGES.UNAUTHORIZED,
    });
  }
};
