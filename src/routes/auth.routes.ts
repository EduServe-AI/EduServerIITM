import { Router } from "express";
import {
  registerStudent,
  loginStudent,
  registerInstructor,
  loginInstructor,
  refreshToken,
} from "../controllers/auth.controller";

const router = Router();

router.post("/student-signup", registerStudent);

router.post("/student-login", loginStudent);

router.post("/instructor-signup", registerInstructor);

router.post("/instructor-login", loginInstructor);

router.post("/refresh-token", refreshToken);

export default router;
