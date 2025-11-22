import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {
  createChatController,
  getChatController,
  generateResponseController,
  getUserChatsController,
} from "../controllers/chat.controller";

const router = Router();

// For Creating new chat
router.post("/create", authMiddleware, createChatController);

// For populating the context
router.get("/:chatId", authMiddleware, getChatController);

// For generating AI Response
router.post("/:chatId/generate", authMiddleware, generateResponseController);

// For listing out user chats
router.get("/user-chats", authMiddleware, getUserChatsController);

export default router;
