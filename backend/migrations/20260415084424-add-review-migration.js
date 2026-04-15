"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint("Reviews", {
      fields: ["userId", "bookId"],
      type: "unique",
      name: "unique_user_book_review",
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("Reviews", "unique_user_book_review");
  },
};
