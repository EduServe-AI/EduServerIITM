import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {
  featuredChatBotController,
  recommendedChatBotController,
  makeBotFeaturedController,
} from "../controllers/chatbot.controller";

const router = Router();

// For Featured ChatBots
router.get("/featured", featuredChatBotController);

// New Route for Recommended ChatBots
router.get("/recommended", authMiddleware, recommendedChatBotController);

// For making a chatbot feature
router.post("/feature", authMiddleware, makeBotFeaturedController);

export default router;
