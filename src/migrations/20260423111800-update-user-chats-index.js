"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Note: The auto-generated index name by Sequelize is usually 'chats_userId' or an array of fields can be used.
    // 1. Remove the old single-column index
    try {
      await queryInterface.removeIndex("chats", ["userId"]);
    } catch (error) {
      console.log("Warning: Could not remove old userId index (it may not exist or have a different name).");
    }

    // 2. Add the new composite index to optimize getUserChatsController
    await queryInterface.addIndex("chats", ["userId", "lastInteractionTime"], {
      name: "chats_userId_lastInteractionTime_idx",
    });
  },

  async down(queryInterface, Sequelize) {
    // 1. Remove the composite index
    try {
      await queryInterface.removeIndex("chats", "chats_userId_lastInteractionTime_idx");
    } catch (error) {
      console.log("Warning: Could not remove the composite index.");
    }

    // 2. Re-add the original single-column index
    await queryInterface.addIndex("chats", ["userId"]);
  },
};
