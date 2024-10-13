import { Router } from "express";
import {
  createCar,
  searchCars,
  createCarValidator,
  searchCarsValidator,
} from "@/controllers/car.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

export const carRouter = Router();

carRouter.post("/", authMiddleware, createCarValidator(), createCar);
carRouter.get("/", searchCarsValidator(), searchCars);
