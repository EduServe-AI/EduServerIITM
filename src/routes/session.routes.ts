import { Router } from "express";
import {
  createSessionController,
  getSessionController,
} from "../controllers/session.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.post("/create-session", authMiddleware, createSessionController);
router.get("/get-session", authMiddleware, getSessionController);

export default router;
