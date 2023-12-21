import request from "supertest";
import { describe, it, expect, beforeEach } from '@jest/globals';
import app from "../../src/app";
import User from "../../src/models/User";

describe("Auth Controller", () => {
  describe("Register user", () => {
    it("should return 201 and the userid", async () => {
      const response = await request(app)
        .post("/register")
        .set("content-type", "application/json")
        .send({
          username: "test",
          password: "test",
        })

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
    });

    it("should not allow duplicate usernames", async () => {
      await User.create({ userName: "testUser", password: "testPassword" });

      const response = await request(app)
        .post("/register")
        .set("content-type", "application/json")
        .send({
          username: "testUser",
          password: "test",
        })

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    })
  });

  describe("Login", () => {
    it("should return a token and user-info for valid users", async () => {
      const user = await User.create({ userName: 'testUser', password: 'password' });

      const response = await request(app)
        .post('/login')
        .set("content-type", "application/json")
        .send({
          username: 'testUser',
          password: 'password'
        })

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("username", "testUser");
      expect(response.body).toHaveProperty("userId", user._id.toString());
    })
  })
});