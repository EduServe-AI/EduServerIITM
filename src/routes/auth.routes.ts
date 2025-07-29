import { Router } from "express";
import {
  registerStudent,
  loginStudent,
  registerInstructor,
  loginInstructor,
} from "../controllers/auth.controller";

const router = Router();

router.post("/student-signup", registerStudent);

router.post("/student-login", loginStudent);

router.post("/instructor-signup", registerInstructor);

router.post("/instructor-login", loginInstructor);

export default router;
