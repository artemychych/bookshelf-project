'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    toJSON() {
      const values = Object.assign({}, this.get());
      delete values.passwordHash;
      return values;
    }
    static associate(models) {
      // Добавляем связь с книгами
      User.hasMany(models.Book, { foreignKey: 'userId' });
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      passwordHash: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'User',
    },
  );
  return User;
};