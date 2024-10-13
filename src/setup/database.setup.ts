import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { BookingEntity, UserEntity, CarEntity } from "@/entities";
import "dotenv/config";

export const AppDataSource = new DataSource({
  type: "postgres", 
  host: process.env.POSTGRES_HOST, 
  username: process.env.POSTGRES_USER, 
  password: process.env.POSTGRES_PASSWORD, 
  port: Number(process.env.POSTGRES_PORT) || 5432, 
  database: process.env.POSTGRES_DB, 
  logging: false,
  synchronize: true,
  entities: [BookingEntity, UserEntity, CarEntity],
  entitySkipConstructor: true,
  namingStrategy: new SnakeNamingStrategy(),
});