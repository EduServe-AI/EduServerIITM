import dotenv from "dotenv";
import path = require("path");

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
}

interface Config {
  port: number;
  nodeEnv: string;
  JWT_SECRET_KEY: string;
  JWT_ACCESS_EXPIRES_IN: string | number;
  JWT_REFRESH_EXPIRES_IN: string | number;
  DOCKER_UNSTRUCTURED_URL: string;
  PROD_UNSTRUCTURED_URL: string;
  PROD_UNSTRUCTURED_KEY: string;
  STREAM_API_KEY: string;
  STREAM_API_SECRET: string;
}

const config: Config = {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV || "development",
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY!,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN!,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN!,
  DOCKER_UNSTRUCTURED_URL: process.env.DOCKER_UNSTUCTURED_URL!,
  PROD_UNSTRUCTURED_URL: process.env.UNSTRUCTURED_URL!,
  PROD_UNSTRUCTURED_KEY: process.env.UNSTRUCTURED_KEY!,
  STREAM_API_KEY: process.env.STREAM_API_KEY!,
  STREAM_API_SECRET: process.env.STREAM_API_SECRET!,
};

export default config;
