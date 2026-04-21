const { sequelize } = require("../../models");

module.exports = {
  setupTestDB: () => {
    beforeAll(async () => {
      await sequelize.sync({ force: true });
    });

    afterEach(async () => {
      // Очищаем все таблицы, но не удаляем структуру
      await sequelize.truncate({ cascade: true, restartIdentity: true });
    });

    afterAll(async () => {
      await sequelize.close();
    });
  },
};
