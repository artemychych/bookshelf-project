// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Регистрация
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Проверка на существующего пользователя
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email уже используется" });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
    });

    // Генерация JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    // Не возвращаем пароль
    const { passwordHash, ...userData } = user.toJSON();

    res.status(201).json({
      message: "Регистрация успешна",
      user: userData,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Вход
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    // Генерация токена
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    // Исключаем passwordHash из ответа
    const { passwordHash, ...userData } = user.toJSON();

    res.json({
      message: "Вход выполнен",
      user: userData,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
