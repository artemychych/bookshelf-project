const express = require("express");
const router = express.Router({ mergeParams: true }); // чтобы получить bookId из родительского роутера
const authMiddleware = require("../middleware/auth");
const { Book, Review, User } = require("../models");

// GET /api/books/:bookId/reviews – все рецензии на книгу (публично)
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { bookId: req.params.bookId },
      include: [{ model: User, attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/books/:bookId/reviews/me – рецензия текущего пользователя на книгу
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findOne({
      where: {
        bookId: req.params.bookId,
        userId: req.user.id,
      },
    });
    res.json(review || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/books/:bookId/reviews – создать рецензию
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { rating, content } = req.body;
    if (!rating || !content) {
      return res
        .status(400)
        .json({ message: "Rating and content are required" });
    }

    // Проверяем, существует ли уже рецензия
    const existing = await Review.findOne({
      where: {
        bookId: req.params.bookId,
        userId: req.user.id,
      },
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Review already exists for this book" });
    }

    // Убедимся, что книга принадлежит пользователю? Не обязательно, но можно.
    const book = await Book.findByPk(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const review = await Review.create({
      rating,
      content,
      bookId: req.params.bookId,
      userId: req.user.id,
    });

    const reviewWithUser = await Review.findByPk(review.id, {
      include: [{ model: User, attributes: ["id", "name"] }],
    });

    res.status(201).json(reviewWithUser);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Review already exists" });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/books/:bookId/reviews/:reviewId – обновить свою рецензию
router.put("/:reviewId", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findOne({
      where: {
        id: req.params.reviewId,
        userId: req.user.id,
        bookId: req.params.bookId,
      },
    });

    if (!review) {
      return res
        .status(404)
        .json({ message: "Review not found or not owned by you" });
    }

    const { rating, content } = req.body;
    await review.update({ rating, content });

    const updated = await Review.findByPk(review.id, {
      include: [{ model: User, attributes: ["id", "name"] }],
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/books/:bookId/reviews/:reviewId – удалить свою рецензию
router.delete("/:reviewId", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findOne({
      where: {
        id: req.params.reviewId,
        userId: req.user.id,
        bookId: req.params.bookId,
      },
    });

    if (!review) {
      return res
        .status(404)
        .json({ message: "Review not found or not owned by you" });
    }

    await review.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
