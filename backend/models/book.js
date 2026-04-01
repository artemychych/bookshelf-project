'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      Book.belongsToMany(models.Author, {
        through: 'BookAuthor',
        foreignKey: 'bookId',
        otherKey: 'authorId',
      });
      Book.hasMany(models.Review, { foreignKey: 'bookId' });
      Book.hasMany(models.Quote, { foreignKey: 'bookId' });
      // Добавляем связь с пользователем
      Book.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  Book.init(
    {
      title: DataTypes.STRING,
      isbn: DataTypes.STRING,
      description: DataTypes.TEXT,
      publishedYear: DataTypes.INTEGER,
      coverUrl: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM('want_to_read', 'reading', 'read'),
        defaultValue: 'want_to_read',
      },
      externalId: DataTypes.STRING,
      userId: DataTypes.INTEGER, // новое поле
    },
    {
      sequelize,
      modelName: 'Book',
    },
  );
  return Book;
};