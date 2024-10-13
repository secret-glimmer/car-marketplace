import { Router } from "express";
import { authRouter } from "./auth.router";
import { carRouter } from "./car.router";

export const router = Router();

router.use("/auth", authRouter);
router.use("/cars", carRouter);
