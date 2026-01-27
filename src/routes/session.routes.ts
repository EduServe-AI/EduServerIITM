import { Router } from "express";
import {
  createSessionController,
  endSessionController,
  getSessionListController,
  joinSessionController,
  tokenSessionController,
} from "../controllers/session.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

// Creating a session with the instructor
router.post("/create-session", authMiddleware, createSessionController);

// Retreiving the individual session
router.get("/:sessionId/join", authMiddleware, joinSessionController);

// Ending the session
router.get("/:id/end", authMiddleware, endSessionController);

// Generating stream token for the session call
router.get("/token", authMiddleware, tokenSessionController);

// Retreiving the list of all the user sessions
router.get("/list", authMiddleware, getSessionListController);

export default router;
