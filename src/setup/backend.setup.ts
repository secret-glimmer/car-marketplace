import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { router } from "@/routers";
import { Logger } from "@/utils";
import { MESSAGES } from "@/consts";
import { errorHandlerMiddleware } from "@/middlewares/errorHandler.middleware";
import { requestLoggerMiddleware } from "@/middlewares/requestLogger.middleware";
import { ROUTE_VERSION } from "@/config";

export const backendSetup = () => {
  const app: Express = express();

  app.use(cors());
  app.use(express.json());

  app.use(requestLoggerMiddleware);

  app.use("/health", (_req: Request, res: Response) => res.send("OK"));

  app.use(`/api/${ROUTE_VERSION}`, router);

  app.use(errorHandlerMiddleware);

  const port = process.env.PORT || 8000;

  app.listen(port, () => {
    Logger.info(MESSAGES.SERVER_RUN_SUCCESS);
  });
};
