import { Router } from "express";
import {
  featuredInstructorController,
  getInstructorDataController,
  instructorOnboardController,
  updateInstructorDataController
} from "../controllers/instructor.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { validateData } from "../middlewares/zod.middleware";
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


// For updating the instructor data
router.put("/me", authMiddleware, updateInstructorDataController);

export default router;
