const express = require("express");
const router = express.Router();
const { Book, Author } = require("../models");

// GET /books – получить все книги
router.get("/", async (req, res) => {
  try {
    const books = await Book.findAll({ include: ["Authors"] });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /books/:id – получить книгу по id
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: ["Authors", "Reviews", "Quotes"],
    });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /books – создать новую книгу
router.post("/", async (req, res) => {
  try {
    const book = await Book.create(req.body);
    // Если переданы авторы, можно добавить связи через BookAuthor
    if (req.body.authorIds) {
      await book.setAuthors(req.body.authorIds);
    }
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /books/:id – обновить книгу
router.put("/:id", async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    await book.update(req.body);
    if (req.body.authorIds) {
      await book.setAuthors(req.body.authorIds);
    }
    res.json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /books/:id – удалить книгу
router.delete("/:id", async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    await book.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
