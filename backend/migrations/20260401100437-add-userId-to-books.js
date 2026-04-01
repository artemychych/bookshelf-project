'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Добавляем столбец userId в таблицу Books
    await queryInterface.addColumn('Books', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true, // или false, если вы хотите обязательное поле
      references: {
        model: 'Users', // название таблицы Users (обычно во множественном числе)
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // или 'CASCADE' если хотите удалять книги при удалении пользователя
    });
  },

  async down(queryInterface, Sequelize) {
    // Откат миграции: удаляем столбец userId
    await queryInterface.removeColumn('Books', 'userId');
  },
};
