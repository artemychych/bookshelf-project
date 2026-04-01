"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Добавляем уникальность
    await queryInterface.addConstraint("Users", {
      fields: ["email"],
      type: "unique",
      name: "unique_email",
    });
    // Меняем поле на NOT NULL (убедитесь, что нет NULL)
    await queryInterface.changeColumn("Users", "email", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
  async down(queryInterface, Sequelize) {
    np;
    // Убираем ограничение NOT NULL
    await queryInterface.changeColumn("Users", "email", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    // Убираем уникальность
    await queryInterface.removeConstraint("Users", "unique_email");
  },
};
