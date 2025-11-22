import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {
  getCoursesList,
  getUserCourses,
} from "../controllers/course.controller";

const router = Router();

router.get("/list", authMiddleware, getCoursesList);

router.get("/user-courses", authMiddleware, getUserCourses);

export default router;
