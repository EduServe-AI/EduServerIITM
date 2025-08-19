import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { getLevelsList } from "../controllers/level.controller";

const router = Router();

router.get("/list", authMiddleware, getLevelsList);

export default router;
