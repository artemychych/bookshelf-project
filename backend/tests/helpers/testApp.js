const express = require("express");
const cors = require("cors");
const authRoutes = require("../../routes/auth");
const booksRouter = require("../../routes/books");
const reviewsRouter = require("../../routes/reviews");
const healthRouter = require("../../routes/health");

function createTestApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", authRoutes);
  app.use("/api/books", booksRouter);
  app.use("/api/books/:bookId/reviews", reviewsRouter);
  app.use("/api", healthRouter);

  return app;
}

module.exports = { createTestApp };
