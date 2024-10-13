import request from "supertest";
import express from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import {
  createCar,
  searchCars,
  createCarValidator,
  searchCarsValidator,
} from "@/controllers";
import { authService, carService } from "@/services";
import { authMiddleware, errorHandlerMiddleware } from "@/middlewares";
import { MESSAGES } from "@/consts";
import { JWT_TOKEN } from "@/config";

const app = express();
app.use(express.json());
app.post("/cars", authMiddleware, createCarValidator(), createCar);
app.get("/cars", searchCarsValidator(), searchCars);
app.use(errorHandlerMiddleware);

const payload = { username: "testUser", uuid: "user-uuid", role: "superuser" };
const token = jwt.sign(payload, JWT_TOKEN);

describe("Car API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockCar = {
    make: "test3",
    model: "model3",
    year: "2023",
    price: 4000,
    mileage: 100,
  };

  describe("POST /cars", () => {
    it("should create a car successfully", async () => {
      jest.spyOn(authService, "getUser").mockResolvedValue({
        uuid: "user-uuid",
        username: "testUser",
        password: "hashed-password",
        role: "superuser",
      });
      jest.spyOn(carService, "createCar").mockResolvedValue({
        uuid: "car-uuid",
        ...mockCar,
      });

      const response = await request(app)
        .post("/cars")
        .set("Authorization", `Bearer ${token}`)
        .send(mockCar);

      expect(response.status).toBe(httpStatus.CREATED);
      expect(response.body).toEqual({
        message: MESSAGES.CAR_CREATION_SUCCESS,
        car: {
          uuid: "car-uuid",
          ...mockCar,
        },
      });
    });

    it("should throw a forbidden error if an user is not superuser", async () => {
      jest.spyOn(authService, "getUser").mockResolvedValue({
        uuid: "user-uuid",
        username: "testUser",
        password: "hashed-password",
        role: "user",
      });

      const payload = { username: "testUser", uuid: "user-uuid", role: "user" };
      const token1 = jwt.sign(payload, JWT_TOKEN);

      const response = await request(app)
        .post("/cars")
        .set("Authorization", `Bearer ${token1}`)
        .send(mockCar);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
      expect(response.body).toEqual({
        message: MESSAGES.ERROR_ROLE_MISMATCH,
      });
    });
  });

  describe("GET /cars", () => {
    const mockCarList = [
      {
        uuid: "7c138eb1-6d10-4db5-be93-57a8336b56ef",
        make: "test1",
        model: "test model1",
        year: "2024",
        price: 5000,
        mileage: 100,
        bookingCount: 1,
      },
      {
        uuid: "7f51bf50-75c9-4b97-a82c-65896f89940d",
        make: "test",
        model: "test model",
        year: "2024",
        price: 5000,
        mileage: 100,
        bookingCount: 0,
      },
      {
        uuid: "c1ac65b1-9d07-46bb-bb68-be41d4f7411e",
        make: "test1",
        model: "model2",
        year: "2021",
        price: 3000,
        mileage: 100,
        bookingCount: 0,
      },
    ];

    it("should return car list", async () => {
      jest.spyOn(carService, "searchCars").mockResolvedValue(mockCarList);
      const response = await request(app).get("/cars");

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(mockCarList);
    });

    it("should return nothing with status code 204 when there is no car list", async () => {
      jest.spyOn(carService, "searchCars").mockResolvedValue([]);
      const response = await request(app).get("/cars");

      expect(response.status).toBe(httpStatus.NO_CONTENT);
    });
  });
});
