const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize } = require("./models");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Простой тестовый маршрут
app.get("/", (req, res) => {
  res.send("BookShelf API is running");
});

// Подключаем маршруты (пока пусто)

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log("Database connected");
  } catch (error) {
    console.error("Unable to connect to database:", error);
  }
});

const booksRouter = require("./routes/books");
app.use("/api/books", booksRouter);
