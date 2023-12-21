import request from "supertest";
import { describe, it, expect, beforeEach } from '@jest/globals';
import app from "../../src/app";

describe("Auth Controller", () => {
  describe("Register user", () => {
    it("should return 201 and the userid", async () => {
      const response = await request(app)
        .post("/register")
        .set("content-type", "application/json")
        .send({
          username: "test",
          password: "test",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
    });
  });
});