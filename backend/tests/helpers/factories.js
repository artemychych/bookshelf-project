const bcrypt = require("bcryptjs");
const { User, Book, Author, Review } = require("../../models");

const createUser = async (overrides = {}) => {
  const password = overrides.password || "password123";
  const passwordHash = await bcrypt.hash(password, 10);
  return User.create({
    name: "Test User",
    email: `test-${Date.now()}@example.com`,
    passwordHash,
    ...overrides,
  });
};

const createBook = async (user, overrides = {}) => {
  return Book.create({
    title: "Test Book",
    userId: user.id,
    ...overrides,
  });
};

const createAuthor = async (overrides = {}) => {
  return Author.create({
    name: "Test Author",
    ...overrides,
  });
};

const createReview = async (user, book, overrides = {}) => {
  return Review.create({
    rating: 5,
    content: "Great book!",
    userId: user.id,
    bookId: book.id,
    ...overrides,
  });
};

module.exports = {
  createUser,
  createBook,
  createAuthor,
  createReview,
};
