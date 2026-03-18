const express = require("express");
const router = express.Router();
const { Book, Author, sequelize } = require("../models");

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
  const t = await sequelize.transaction();
  try {
    // Проверяем, есть ли уже книга с таким externalId
    let book = null;
    if (req.body.externalId) {
      book = await Book.findOne({ where: { externalId: req.body.externalId } });
    }

    if (!book) {
      // Создаём новую книгу
      book = await Book.create(req.body, { transaction: t });
    } else {
      // Если книга уже есть, можно обновить её поля (опционально)
      await book.update(req.body, { transaction: t });
    }

    // Обрабатываем авторов, если передан массив authorNames
    if (req.body.authorNames && Array.isArray(req.body.authorNames)) {
      const authors = [];
      for (const name of req.body.authorNames) {
        let author = await Author.findOne({ where: { name } });
        if (!author) {
          author = await Author.create({ name }, { transaction: t });
        }
        authors.push(author);
      }
      await book.setAuthors(authors, { transaction: t });
    }

    await t.commit();

    // Возвращаем книгу с авторами
    const bookWithAuthors = await Book.findByPk(book.id, {
      include: [{ model: Author, as: "Authors" }],
    });
    res.status(201).json(bookWithAuthors);
  } catch (error) {
    await t.rollback();
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
