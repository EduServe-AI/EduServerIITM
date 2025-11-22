import dotenv from "dotenv";
import path from "path";
import pg from "pg";
import pgvector from "pgvector/sequelize";
import { Sequelize } from "sequelize";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
}

const getSslConfig = () => {
  if (process.env.NODE_ENV === "production") {
    return {
      require: true,
      rejectUnauthorized: false, // Or true, depending on CA setup
    };
  }
  return false; // Allow disabling for local development
};

const connectionString = process.env.DATABASE_URL as string;

if (!connectionString) {
  throw new Error("Database connection string is missing");
}

const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  dialectModule: pg,
  logging: false,
  dialectOptions: {
    ssl: getSslConfig(),
  },
});

const initialize = async () => {
  try {
    // Create vector extension if it doesn't exist
    await sequelize.query("CREATE EXTENSION IF NOT EXISTS vector");

    pgvector.registerTypes(Sequelize);

    console.log("Vector extension and type registered successfully");
  } catch (error) {
    console.error("Error initializing vector support:", error);
  }
};

// Initialize vector support
initialize();

export default sequelize;
