import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { validateData } from "../middlewares/zod.middleware";
import { instructorOnboardController } from "../controllers/instructor.controller";
import { instructorOnboardSchema } from "../utils/validator";

const router = Router();

// For Instructor Onboarding
router.post(
  "/onboarding",
  authMiddleware,
  validateData(instructorOnboardSchema),
  instructorOnboardController
);

export default router;
