import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { featuredChatBotController } from "../controllers/chatbot.controller";

const router = Router();

// For Featured ChatBots
router.get("/featured", featuredChatBotController);

export default router;
