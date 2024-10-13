import request from "supertest";
import express from "express";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import {
  register,
  login,
  registerValidator,
  loginValidator,
} from "@/controllers";
import { authService } from "@/services";
import { errorHandlerMiddleware } from "@/middlewares";
import { MESSAGES } from "@/consts";

const app = express();
app.use(express.json());
app.post("/register", registerValidator(), register);
app.post("/login", loginValidator(), login);
app.use(errorHandlerMiddleware);
jest.mock("bcryptjs");

describe("Auth API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /register", () => {
    it("should create a user and return 201", async () => {
      jest.spyOn(authService, "getUser").mockResolvedValue(null); // No existing user
      jest.spyOn(authService, "register").mockResolvedValue({
        uuid: "ddf",
        username: "testUser",
        password: "hashed-password123",
        role: "user",
      });

      bcrypt.hash.mockResolvedValue("hashed-password123"); // Mock password hashing

      const response = await request(app)
        .post("/register")
        .send({ username: "testUser", password: "password123", role: "user" });

      expect(response.status).toBe(httpStatus.CREATED);
      expect(response.body).toHaveProperty("user");
      expect(authService.register).toHaveBeenCalledWith({
        username: "testUser",
        password: "hashed-password123",
        role: "user",
      });
    });

    it("should return 409 if user already exists", async () => {
      jest.spyOn(authService, "getUser").mockResolvedValue({
        uuid: "4r2e-33e3-5t5t-dfre-33r3-eee4",
        username: "testUser",
        password: "hashed-password123",
        role: "user",
      });

      const response = await request(app)
        .post("/register")
        .send({ username: "testUser", password: "password123", role: "user" });

      expect(response.status).toBe(httpStatus.CONFLICT);
      expect(response.body).toEqual({
        message: MESSAGES.USER_DUPLICATED,
      });
    });

    it("should return 400 if missing fields", async () => {
      jest.spyOn(authService, "getUser").mockResolvedValue(null);
      const response = await request(app)
        .post("/register")
        .send({ username: "testUser" });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
      expect(response.body).toEqual({
        message: MESSAGES.INVALID_ARGUMENTS,
        errors: [MESSAGES.PASSWORD_REQUIRED],
      });
    });
  });

  describe("POST /login", () => {
    it("should log in the user and return 200 with token", async () => {
      const user = {
        username: "testUser",
        password: "hashed-password123",
        uuid: "1",
        role: "user",
      };
      jest.spyOn(authService, "getUser").mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      const response = await request(app)
        .post("/login")
        .send({ username: "testUser", password: "password123" });

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toHaveProperty("token");
      expect(response.body.message).toBe(MESSAGES.LOGIN_SUCCESS);
    });

    it("should return 401 if user does not exist", async () => {
      jest.spyOn(authService, "getUser").mockResolvedValue(null);

      const response = await request(app)
        .post("/login")
        .send({ username: "wrongUser", password: "wrongPassword" });

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      expect(response.body).toEqual({ message: MESSAGES.INVALID_CREDENTIALS });
    });

    it("should return 401 if password is incorrect", async () => {
      const user = {
        username: "testUser",
        password: "hashed-password123",
        uuid: "1",
        role: "user",
      };
      jest.spyOn(authService, "getUser").mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false); // Password does not match

      const response = await request(app)
        .post("/login")
        .send({ username: "testUser", password: "wrongPassword" });

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      expect(response.body).toEqual({ message: MESSAGES.INVALID_CREDENTIALS });
    });
  });
});
