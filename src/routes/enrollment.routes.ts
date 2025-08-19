import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {
  getEnrollmentsList,
  addCourses,
  userEnrollments,
} from "../controllers/enrollment.controller";

const router = Router();

router.get("/list", authMiddleware, getEnrollmentsList);

router.post("/add-courses", authMiddleware, addCourses);

router.get("/user-enrollments", authMiddleware, userEnrollments);

export default router;
