import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { createChatController } from "../controllers/chat.controller";

const router = Router();

// For Creating new chat
router.post("/create", authMiddleware, createChatController);

export default router;
