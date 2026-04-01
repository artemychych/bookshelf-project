const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { Book, Author, sequelize } = require('../models');

router.use(authMiddleware);

// GET /books – получить все книги текущего пользователя
router.get('/', async (req, res) => {
  try {
    const books = await Book.findAll({
      where: { userId: req.user.id }, // фильтруем по пользователю
      include: ['Authors'],
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /books/:id – получить книгу по id, если она принадлежит пользователю
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: ['Authors', 'Reviews', 'Quotes'],
    });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /books – создать новую книгу с привязкой к пользователю
router.post('/', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let book = null;
    if (req.body.externalId) {
      // Поиск книги по внешнему ID, но только среди книг текущего пользователя
      book = await Book.findOne({
        where: { externalId: req.body.externalId, userId: req.user.id },
      });
    }

    if (!book) {
      // Создаём новую книгу с userId текущего пользователя
      book = await Book.create(
        { ...req.body, userId: req.user.id },
        { transaction: t }
      );
    } else {
      // Если книга уже есть у пользователя, можно обновить её поля
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

    const bookWithAuthors = await Book.findByPk(book.id, {
      include: [{ model: Author, as: 'Authors' }],
    });
    res.status(201).json(bookWithAuthors);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
});

// PUT /books/:id – обновить книгу, только если она принадлежит пользователю
router.put('/:id', async (req, res) => {
  try {
    const book = await Book.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    await book.update(req.body);
    if (req.body.authorIds) {
      await book.setAuthors(req.body.authorIds);
    }
    res.json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /books/:id – удалить книгу, только если она принадлежит пользователю
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    await book.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;