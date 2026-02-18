"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Book.belongsToMany(models.Author, {
        through: "BookAuthor",
        foreignKey: "bookId",
        otherKey: "authorId",
      });
      Book.hasMany(models.Review, { foreignKey: "bookId" });
      Book.hasMany(models.Quote, { foreignKey: "bookId" });
    }
  }
  Book.init(
    {
      title: DataTypes.STRING,
      isbn: DataTypes.STRING,
      description: DataTypes.TEXT,
      publishedYear: DataTypes.INTEGER,
      coverUrl: DataTypes.STRING,
      status: DataTypes.ENUM,
    },
    {
      sequelize,
      modelName: "Book",
    },
  );
  return Book;
};
