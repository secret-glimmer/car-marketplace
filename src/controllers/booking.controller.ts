import { Request, Response } from "express";
import { body, param } from "express-validator";
import { bookingService, carService } from "@/services";
import { CustomError } from "@/errors";
import { MESSAGES } from "@/consts";
import httpStatus from "http-status";
import { errorHandlerWrapper } from "@/utils";
import { AuthRequest } from "@/types";

export const createBookingValidator = () => {
  return [body("carId").exists().withMessage(MESSAGES.CARID_REQUIRED)];
};

export const cancelBookingValidator = () => {
  return [param("id").exists().withMessage(MESSAGES.BOOKINGID_REQUIRED)];
};

const createBookingHandler = async (req: AuthRequest, res: Response) => {
  const { carId } = req.body;
  const userId = req.user.uuid;

  const existedCar = await carService.getCarById(carId);
  if (!existedCar) {
    throw new CustomError(MESSAGES.CAR_NOT_FOUND, httpStatus.BAD_REQUEST);
  }

  const checkDuplication = await bookingService.getBookingByCar(carId, userId);
  if (checkDuplication) {
    throw new CustomError(MESSAGES.BOOKING_DUPLICATED, httpStatus.CONFLICT);
  }

  const booking = await bookingService.createBooking({
    userId,
    carId,
    date: new Date(),
  });

  res.status(httpStatus.CREATED).json({ booking });
};

const cancelBookingHandler = async (req: AuthRequest, res: Response) => {
  const bookingId = req.params.id;
  const booking = await bookingService.getBookingById(bookingId);

  if (!booking) {
    throw new CustomError(MESSAGES.NOT_FOUND_MESSAGE, httpStatus.NOT_FOUND);
  }
  if (booking.userId !== req.user.uuid) {
    throw new CustomError(
      MESSAGES.CANCEL_PERMISSION_DENIED,
      httpStatus.FORBIDDEN
    );
  }

  const hoursSinceBooking =
    (new Date().getTime() - new Date(booking.date).getTime()) /
    (1000 * 60 * 60);
  if (hoursSinceBooking < 24) {
    throw new CustomError(
      MESSAGES.CANCELLATION_POLICY_MESSAGE,
      httpStatus.BAD_REQUEST
    );
  }

  await bookingService.cancelBooking(bookingId);
  res
    .status(httpStatus.OK)
    .json({ message: MESSAGES.BOOKING_CANCELLATION_SUCCESS });
};

export const createBooking = errorHandlerWrapper(createBookingHandler);
export const cancelBooking = errorHandlerWrapper(cancelBookingHandler);
