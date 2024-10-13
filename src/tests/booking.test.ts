import request from "supertest";
import express from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import {
  createBooking,
  cancelBooking,
  createBookingValidator,
  cancelBookingValidator,
} from "@/controllers";
import { authService, bookingService, carService } from "@/services";
import { authMiddleware, errorHandlerMiddleware } from "@/middlewares";
import { MESSAGES } from "@/consts";
import { JWT_TOKEN } from "@/config";

const app = express();
app.use(express.json());
app.post("/bookings", authMiddleware, createBookingValidator(), createBooking);
app.delete(
  "/bookings/:id",
  authMiddleware,
  cancelBookingValidator(),
  cancelBooking
);
app.use(errorHandlerMiddleware);

const payload = { username: "testUser", uuid: "user-uuid", role: "user" };
const token = jwt.sign(payload, JWT_TOKEN);

describe("Booking API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /bookings", () => {
    it("should create a booking successfully", async () => {
      jest.spyOn(bookingService, "getBookingByCar").mockResolvedValue(null);
      jest.spyOn(carService, "getCarById").mockResolvedValue({
        uuid: "car-uuid",
        make: "test",
        model: "test",
        year: "2020",
        price: 5000,
        mileage: 10,
      });
      jest.spyOn(authService, "getUser").mockResolvedValue({
        uuid: "user-uuid",
        username: "testUser",
        password: "hashed-password",
        role: "user",
      });
      jest.spyOn(bookingService, "createBooking").mockResolvedValue({
        uuid: "test-uuid",
        userId: "user-uuid",
        carId: "car-uuid",
        date: new Date(),
      });

      const response = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${token}`)
        .send({ carId: "car-uuid" });

      expect(response.status).toBe(httpStatus.CREATED);
      expect(response.body).toHaveProperty("booking");
    });

    it("should throw a conflict error if booking is duplicated", async () => {
      jest.spyOn(bookingService, "getBookingByCar").mockResolvedValue({
        uuid: "test-uuid",
        userId: "user-uuid",
        carId: "car-uuid",
        date: new Date("2024-09-02T13:27:46.314Z"),
      });

      const response = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${token}`)
        .send({ carId: "car-uuid" });

      expect(response.status).toBe(httpStatus.CONFLICT);
      expect(response.body).toEqual({
        message: MESSAGES.BOOKING_DUPLICATED,
      });
    });

    it("should throw an error if car is not existed.", async () => {
      jest.spyOn(carService, "getCarById").mockResolvedValue(null);
      const response = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${token}`)
        .send({ carId: "car-uuid" });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
      expect(response.body).toEqual({
        message: MESSAGES.CAR_NOT_FOUND,
      });
    });

    it("should throw an error if there is no token", async () => {
      const response = await request(app)
        .post("/bookings")
        .send({ carId: "car-uuid" });

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      expect(response.body).toEqual({
        message: MESSAGES.UNAUTHORIZED,
      });
    });
  });

  describe("DELETE /bookings:/id", () => {
    it("should cancel a booking successfully", async () => {
      const dateTwoDaysAgo = new Date();
      dateTwoDaysAgo.setDate(dateTwoDaysAgo.getDate() - 2);
      jest.spyOn(bookingService, "getBookingById").mockResolvedValue({
        uuid: "test-uuid",
        userId: "user-uuid",
        carId: "car-uuid",
        date: dateTwoDaysAgo,
      });

      jest.spyOn(bookingService, "cancelBooking").mockResolvedValue(true);

      const response = await request(app)
        .delete(`/bookings/test-uuid`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body.message).toBe(MESSAGES.BOOKING_CANCELLATION_SUCCESS);
    });

    it("should thorw an error if booking is not existed.", async () => {
      jest.spyOn(bookingService, "getBookingById").mockResolvedValue(null);

      const response = await request(app)
        .delete(`/bookings/test-uuid`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
      expect(response.body).toEqual({ message: MESSAGES.NOT_FOUND_MESSAGE });
    });

    it("should throw an error if the booking belongs to a different user.", async () => {
      const dateTwoDaysAgo = new Date();
      dateTwoDaysAgo.setDate(dateTwoDaysAgo.getDate() - 2);
      jest.spyOn(bookingService, "getBookingById").mockResolvedValue({
        uuid: "test-uuid",
        userId: "user-uuid-1",
        carId: "car-uuid",
        date: dateTwoDaysAgo,
      });

      const response = await request(app)
        .delete(`/bookings/test-uuid`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
      expect(response.body).toEqual({
        message: MESSAGES.CANCEL_PERMISSION_DENIED,
      });
    });

    it("should thorw an error if a booking time is within 24 hours it was made", async () => {
      const dateFourHoursAgo = new Date();
      dateFourHoursAgo.setHours(dateFourHoursAgo.getHours() - 4);
      jest.spyOn(bookingService, "getBookingById").mockResolvedValue({
        uuid: "test-uuid",
        userId: "user-uuid",
        carId: "car-uuid",
        date: dateFourHoursAgo,
      });

      const response = await request(app)
        .delete(`/bookings/test-uuid`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
      expect(response.body).toEqual({
        message: MESSAGES.CANCELLATION_POLICY_MESSAGE,
      });
    });
  });
});
