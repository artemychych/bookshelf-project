const request = require("supertest");
const jwt = require("jsonwebtoken");
const { createTestApp } = require("./helpers/testApp");
const { setupTestDB } = require("./helpers/setup");
const { createUser, createBook, createReview } = require("./helpers/factories");

setupTestDB();

describe("Reviews API", () => {
  const app = createTestApp();

  let user, otherUser, token, book;

  beforeEach(async () => {
    user = await createUser();
    otherUser = await createUser();
    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    book = await createBook(user);
  });

  describe("POST /api/books/:bookId/reviews", () => {
    test("should create a review", async () => {
      const response = await request(app)
        .post(`/api/books/${book.id}/reviews`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 4, content: "Nice read" });

      expect(response.status).toBe(201);
      expect(response.body.rating).toBe(4);
      expect(response.body.content).toBe("Nice read");
      expect(response.body.User.name).toBe(user.name);
    });

    test("should prevent duplicate reviews", async () => {
      await createReview(user, book);

      const response = await request(app)
        .post(`/api/books/${book.id}/reviews`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 3, content: "Second try" });

      expect(response.status).toBe(409);
    });
  });

  describe("PUT /api/books/:bookId/reviews/:reviewId", () => {
    test("should update own review", async () => {
      const review = await createReview(user, book);

      const response = await request(app)
        .put(`/api/books/${book.id}/reviews/${review.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 2, content: "Changed mind" });

      expect(response.status).toBe(200);
      expect(response.body.rating).toBe(2);
    });

    test("should return 404 when updating review of another user", async () => {
      const otherReview = await createReview(otherUser, book);

      const response = await request(app)
        .put(`/api/books/${book.id}/reviews/${otherReview.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 1 });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/books/:bookId/reviews/:reviewId", () => {
    test("should delete own review", async () => {
      const review = await createReview(user, book);

      const response = await request(app)
        .delete(`/api/books/${book.id}/reviews/${review.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(204);
    });
  });
});
