import { Router } from "express";
import {
  featuredChatBotController,
  getBotsController,
  makeBotFeaturedController,
  recommendedChatBotController,
} from "../controllers/chatbot.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

// For Featured ChatBots
router.get("/featured", featuredChatBotController);

// New Route for Recommended ChatBots
router.get("/recommended", authMiddleware, recommendedChatBotController);

// For making a chatbot feature
router.post("/feature", authMiddleware, makeBotFeaturedController);

// For searching chatbots
router.get("/", authMiddleware, getBotsController);

export default router;
