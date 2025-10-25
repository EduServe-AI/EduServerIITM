import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { validateData } from "../middlewares/zod.middleware";
import {
  instructorOnboardController,
  featuredInstructorController,
  getInstructorDataController,
} from "../controllers/instructor.controller";
import { instructorOnboardSchema } from "../utils/validator";

const router = Router();

// For Instructor Onboarding
router.post(
  "/onboarding",
  authMiddleware,
  validateData(instructorOnboardSchema),
  instructorOnboardController
);

// For Featured Instructors
router.get("/featured", featuredInstructorController);

// For getting instructor data to store on context
router.get("/me", authMiddleware, getInstructorDataController);

export default router;
