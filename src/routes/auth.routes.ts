import { Router } from "express";
import { registerStudent } from "../controllers/auth.controller";

const router = Router();

router.post("/student-signup", registerStudent)


export default router; 