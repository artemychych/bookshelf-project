"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "Authors",
      [
        {
          name: "Лев Толстой",
          bio: "Великий русский писатель",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Фёдор Достоевский",
          bio: "Классик мировой литературы",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Authors", null, {});
  },
};
