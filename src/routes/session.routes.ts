import { Router } from "express";
import {
  createSessionController,
  endSessionController,
  getSessionController,
  joinSessionController,
  tokenSessionController,
} from "../controllers/session.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.post("/create-session", authMiddleware, createSessionController);
router.get("/get-session", authMiddleware, getSessionController);
router.get("/:sessionId/join", authMiddleware, joinSessionController);
router.get("/:id/end", authMiddleware, endSessionController);

router.get("/token", authMiddleware, tokenSessionController);

export default router;
