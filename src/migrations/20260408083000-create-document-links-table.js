"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("document_links", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      courseId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "courses",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      sourceFilename: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      documentUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });

    // Unique composite index for fast lookups and preventing duplicates
    await queryInterface.addIndex("document_links", ["courseId", "sourceFilename"], {
      unique: true,
      name: "document_links_courseId_sourceFilename_unique",
    });

    // Index for listing all links by course
    await queryInterface.addIndex("document_links", ["courseId"], {
      name: "document_links_courseId_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("document_links");
  },
};
