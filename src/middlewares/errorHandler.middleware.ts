import { ArgumentValidationError, CustomError } from "@/errors";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import { Logger } from "@/utils";

export const errorHandlerMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  Logger.error(JSON.stringify(error));

  if (error instanceof ArgumentValidationError) {
    return res.status(error.errorCode).json(error.toJSON());
  }
  if (error instanceof CustomError) {
    res.status(error.errorCode).json({
      message: error.message,
    });
  }

  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    message: (error as Error).message,
  });
};
