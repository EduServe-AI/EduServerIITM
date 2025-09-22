import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const getSslConfig = () => {
  if (process.env.NODE_ENV === "production") {
    return {
      require: true,
      rejectUnauthorized: false, // Or true, depending on CA setup
    };
  }
  return false; // Allow disabling for local development
};

export const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: getSslConfig(),
  },
});
