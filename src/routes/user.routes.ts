import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { updateUserController } from "../controllers/user.controller";
import { updateUserSchema } from "../utils/validator";
import { validateData } from "../middlewares/zod.middleware";

const router = Router();

router.patch(
  "/update",
  authMiddleware,
  validateData(updateUserSchema),
  updateUserController
);

export default router;
