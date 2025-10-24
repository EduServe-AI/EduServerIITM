import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { validateData } from "../middlewares/zod.middleware";
import { getStudentDataController } from "../controllers/student.controller";

const router = Router();

router.get("/me", authMiddleware, getStudentDataController);

export default router;
