import { Router } from "express";
import passport from "../config/passport.config";
import {
  loginInstructor,
  loginStudent,
  logOutController,
  refreshToken,
  registerInstructor,
  registerStudent,
} from "../controllers/auth.controller";
import { googleCallback } from "../controllers/oauth.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.post("/student-signup", registerStudent);

router.post("/student-login", loginStudent);

router.post("/instructor-signup", registerInstructor);

router.post("/instructor-login", loginInstructor);

router.post("/refresh-token", refreshToken);

router.post("/logout", authMiddleware, logOutController);

// Google OAuth Routes for Students
router.get(
  "/google/student",
  passport.authenticate("google-student", {
    scope: ["email", "profile"],
  })
);

router.get(
  "/google/student/callback",
  passport.authenticate("google-student", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=authentication_failed`,
  }),
  googleCallback
);

// Google OAuth Routes for Instructors
router.get(
  "/google/instructor",
  passport.authenticate("google-instructor", {
    scope: ["email", "profile"],
  })
);

router.get(
  "/google/instructor/callback",
  passport.authenticate("google-instructor", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=authentication_failed`,
  }),
  googleCallback
);

export default router;
