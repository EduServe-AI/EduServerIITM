import { Router } from "express";
import {
  createChatController,
  generateResponseController,
  getChatController,
  getUserChatsController,
} from "../controllers/chat.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

// For Creating new chat
router.post("/create", authMiddleware, createChatController);

// For listing out user chats
router.get("/user-chats", authMiddleware, getUserChatsController);

// For populating the context
router.get("/:chatId", authMiddleware, getChatController);

// For generating AI Response
router.post("/:chatId/generate", authMiddleware, generateResponseController);

export default router;
