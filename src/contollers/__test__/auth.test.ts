import { Request, Response } from "express";
import {
  describe,
  expect,
  test,
  beforeEach,
  jest,
  afterEach,
} from "@jest/globals";
import { logIn, profile } from "../auth";
import User from "../../models/User";

jest.mock("../../models/User");

let UserMock: jest.Mocked<typeof User>;

describe("userController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    UserMock = jest.mocked(User);
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("profile returns user data if user is found", async () => {
    UserMock.findById.mockResolvedValue({ _id: "anId", userName: "test" });
    mockRequest.params = { id: "userId" };

    await profile(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      id: "anId",
      userName: "test",
    });
  });

  test("profile returns 404 if user is not found", async () => {
    UserMock.findById.mockResolvedValue(null);
    mockRequest.params = { id: "userId" };

    await profile(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "User not found",
    });
  });
});
