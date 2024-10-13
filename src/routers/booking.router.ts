import { Router } from "express";
import {
  createBooking,
  cancelBooking,
  createBookingValidator,
  cancelBookingValidator,
} from "@/controllers/booking.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

export const bookingRouter = Router();

bookingRouter.post(
  "/",
  authMiddleware,
  createBookingValidator(),
  createBooking
);

bookingRouter.delete(
  "/:id",
  authMiddleware,
  cancelBookingValidator(),
  cancelBooking
);
