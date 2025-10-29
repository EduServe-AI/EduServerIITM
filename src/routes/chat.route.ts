import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {
  createChatController,
  getChatController,
} from "../controllers/chat.controller";

const router = Router();

// For Creating new chat
router.post("/create", authMiddleware, createChatController);

// For populating the context
router.get("/:chatId", authMiddleware, getChatController);

export default router;
