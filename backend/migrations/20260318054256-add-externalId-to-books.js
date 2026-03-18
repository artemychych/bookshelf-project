"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Books", "externalId", {
      type: Sequelize.STRING,
      allowNull: true, // разрешаем NULL для уже существующих записей
      unique: false, // можно сделать true, если externalId должен быть уникальным
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Books", "externalId");
  },
};
