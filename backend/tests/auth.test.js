const request = require("supertest");
const { createTestApp } = require("./helpers/testApp");
const { setupTestDB } = require("./helpers/setup");
const { createUser } = require("./helpers/factories");

setupTestDB();

describe("Authentication API", () => {
  const app = createTestApp();

  describe("POST /api/auth/register", () => {
    test("should register a new user and return token", async () => {
      const response = await request(app).post("/api/auth/register").send({
        name: "John Doe",
        email: "john@example.com",
        password: "secret123",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).toMatchObject({
        name: "John Doe",
        email: "john@example.com",
      });
      expect(response.body.user).not.toHaveProperty("passwordHash");
    });

    test("should return 400 if email already exists", async () => {
      await createUser({ email: "existing@example.com" });

      const response = await request(app).post("/api/auth/register").send({
        name: "Another",
        email: "existing@example.com",
        password: "pass123",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Email уже используется/i);
    });
  });

  describe("POST /api/auth/login", () => {
    test("should login with correct credentials", async () => {
      const user = await createUser({
        email: "login@example.com",
        password: "mypassword",
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "login@example.com", password: "mypassword" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.email).toBe("login@example.com");
    });

    test("should return 401 for wrong password", async () => {
      const user = await createUser({
        email: "wrong@example.com",
        password: "correct",
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "wrong@example.com", password: "incorrect" });

      expect(response.status).toBe(401);
    });
  });
});
