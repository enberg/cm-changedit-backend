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
        .expect(201)
        ;

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
    });

    it("shouldn't allow duplicate usernames", async () => {
      await User.create({ userName: 'testUser', password: 'testPasword' });
      
        const response = await request(app)
          .post('/register')
          .set('Content-Type', 'application/json')
          .send({
            username: 'testUser',
            password: 'whadevs'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Username taken')
    })
  });

  describe("Login", () => {
    it("it should return a token and user-info on login", async () => {
      const user = await User.create({ userName: 'testUser', password: 'testPassword' });

      const response = await request(app)
        .post('/login')
        .set("Content-Type", "application/json")
        .send({
          username: 'testUser',
          password: 'testPassword'
        });

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("token")
      expect(response.body).toHaveProperty("username", "testUser")
      expect(response.body).toHaveProperty("userId", user._id.toString())
    })
  })
});