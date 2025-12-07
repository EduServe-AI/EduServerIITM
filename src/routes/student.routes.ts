import { Router } from "express";
import { getStudentDataController } from "../controllers/student.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, getStudentDataController);

export default router;
