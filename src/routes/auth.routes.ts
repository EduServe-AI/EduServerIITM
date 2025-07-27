import { Router } from "express";
import { 
    registerStudent , 
    loginStudent
} from "../controllers/auth.controller";

const router = Router();

router.post("/student-signup", registerStudent)

router.post("/student-login", loginStudent) 


export default router; 