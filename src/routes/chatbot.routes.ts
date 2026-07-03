import { Router } from "express";
import {
  featuredChatBotController,
  getBotByIdController,
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

// Public: Get single bot by ID (no auth — used for OG meta tags / link previews)
router.get("/:botId", getBotByIdController);

export default router;
