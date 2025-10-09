import { Router } from "express";
import {
  registerStudent,
  loginStudent,
  registerInstructor,
  loginInstructor,
  refreshToken,
  logOutController,
} from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.post("/student-signup", registerStudent);

router.post("/student-login", loginStudent);

router.post("/instructor-signup", registerInstructor);

router.post("/instructor-login", loginInstructor);

router.post("/refresh-token", refreshToken);

router.post("/logout", authMiddleware, logOutController);

export default router;
