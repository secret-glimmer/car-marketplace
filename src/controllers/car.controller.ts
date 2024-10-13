import { Request, Response } from "express";
import { body } from "express-validator";
import httpStatus from "http-status";
import { carService } from "@/services";
import { CustomError } from "@/errors";
import { MESSAGES } from "@/consts";
import { errorHandlerWrapper } from "@/utils";
import { AuthRequest } from "@/types";

export const createCarValidator = () => {
  return [
    body("make").exists().withMessage(MESSAGES.MAKE_REQUIRED),
    body("model").exists().withMessage(MESSAGES.MODEL_REQUIRED),
    body("year").exists().withMessage(MESSAGES.YEAR_REQUIRED),
    body("price")
      .exists()
      .withMessage(MESSAGES.PRICE_REQUIRED)
      .isNumeric()
      .withMessage(MESSAGES.INVALID_PRICE),
    body("mileage")
      .exists()
      .withMessage(MESSAGES.MILEAGE_REQUIRED)
      .isNumeric()
      .withMessage(MESSAGES.INVALID_MILEAGE),
  ];
};

export const searchCarsValidator = () => {
  return [
    body("price").optional().isNumeric().withMessage(MESSAGES.INVALID_PRICE),
    body("mileage")
      .optional()
      .isNumeric()
      .withMessage(MESSAGES.INVALID_MILEAGE),
  ];
};

const createCarHandler = async (req: AuthRequest, res: Response) => {
  if (req.user.role !== "superuser") {
    throw new CustomError(MESSAGES.ERROR_ROLE_MISMATCH, httpStatus.FORBIDDEN);
  }

  const { make, model, year, price, mileage } = req.body;
  const car = await carService.createCar({
    make,
    model,
    year,
    price,
    mileage,
  });
  res
    .status(httpStatus.CREATED)
    .json({ message: MESSAGES.CAR_CREATION_SUCCESS, car });
};

const searchCarsHandler = async (req: Request, res: Response) => {
  const { make, model, price, year, mileage } = req.query;
  const filters: any = {};
  if (make) filters.make = make;
  if (model) filters.model = model;
  if (price) filters.price = price;
  if (year) filters.year = year;
  if (mileage) filters.mileage = mileage;

  const cars = await carService.searchCars(filters);
  if (cars.length > 0) {
    res.status(httpStatus.OK).json(cars);
  } else {
    res.status(httpStatus.NO_CONTENT).send();
  }
};

export const createCar = errorHandlerWrapper(createCarHandler);
export const searchCars = errorHandlerWrapper(searchCarsHandler);
