const request = require("supertest");
const jwt = require("jsonwebtoken");
const { createTestApp } = require("./helpers/testApp");
const { setupTestDB } = require("./helpers/setup");
const { createUser, createBook, createAuthor } = require("./helpers/factories");

setupTestDB();

describe("Books API", () => {
  const app = createTestApp();

  let user, token;
  beforeEach(async () => {
    user = await createUser();
    token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );
  });

  describe("GET /api/books", () => {
    test("should return only books belonging to the user", async () => {
      const otherUser = await createUser();
      await createBook(user, { title: "User Book 1" });
      await createBook(user, { title: "User Book 2" });
      await createBook(otherUser, { title: "Other User Book" });

      const response = await request(app)
        .get("/api/books")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body.map((b) => b.title)).toEqual(
        expect.arrayContaining(["User Book 1", "User Book 2"]),
      );
    });

    test("should return 401 if no token provided", async () => {
      const response = await request(app).get("/api/books");
      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/books", () => {
    test("should create a new book with authors", async () => {
      const response = await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "New Book",
          isbn: "1234567890",
          authorNames: ["Author One", "Author Two"],
          status: "want_to_read",
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe("New Book");
      expect(response.body.userId).toBe(user.id);
      expect(response.body.Authors).toHaveLength(2);
    });

    test("should update existing book if externalId matches user book", async () => {
      const existing = await createBook(user, {
        externalId: "ext123",
        title: "Old Title",
      });

      const response = await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${token}`)
        .send({
          externalId: "ext123",
          title: "Updated Title",
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe("Updated Title");
    });
  });

  describe("PUT /api/books/:id", () => {
    test("should update own book", async () => {
      const book = await createBook(user, { title: "Before" });

      const response = await request(app)
        .put(`/api/books/${book.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "After" });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe("After");
    });

    test("should return 404 when updating book of another user", async () => {
      const otherUser = await createUser();
      const book = await createBook(otherUser, { title: "Not mine" });

      const response = await request(app)
        .put(`/api/books/${book.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Hacked" });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/books/:id", () => {
    test("should delete own book", async () => {
      const book = await createBook(user);

      const response = await request(app)
        .delete(`/api/books/${book.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(204);

      const found = await request(app)
        .get(`/api/books/${book.id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(found.status).toBe(404);
    });
  });
});
