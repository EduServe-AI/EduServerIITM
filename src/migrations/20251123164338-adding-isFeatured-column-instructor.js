'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface , Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn(
      'instructorprofiles',
      'isFeatured',
      {
        type : Sequelize.BOOLEAN,
        defaultValue : false,
        allowNull : false
      }
    )
  },

  async down (queryInterface) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn(
      'instructorprofiles',
      'isFeatured'
    )
  }
};
