import { Router } from "express";
import {
  register,
  login,
  registerValidator,
  loginValidator,
} from "@/controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/register", registerValidator(), register);
authRouter.post("/login", loginValidator(), login);
