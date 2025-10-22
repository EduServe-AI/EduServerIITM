import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {
  featuredChatBotController,
  recommendedChatBotController,
} from "../controllers/chatbot.controller";

const router = Router();

// For Featured ChatBots
router.get("/featured", featuredChatBotController);

// New Route for Recommended ChatBots
router.get("/recommended", authMiddleware, recommendedChatBotController);

export default router;
