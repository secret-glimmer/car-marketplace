import { Request } from "express";

import { UserEntity } from "@/entities";

export interface AuthRequest extends Request {
  user?: UserEntity;
}
