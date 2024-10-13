import { Router } from "express";
import { authRouter } from "./auth.router";
import { carRouter } from "./car.router";
import { bookingRouter } from "./booking.router";

export const router = Router();

router.use("/auth", authRouter);
router.use("/cars", carRouter);
router.use("/bookings", bookingRouter);
