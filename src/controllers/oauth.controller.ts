import { Request, Response } from "express";
import User from "../models/user.model";
import { generateToken } from "../utils/jwt";

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=authentication_failed`
      );
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateToken(user.id, user.role);

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    // Redirect to frontend with access token and user role
    const redirectUrl = `${process.env.FRONTEND_URL}/callback?token=${accessToken}&role=${user.role}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.redirect(
      `${process.env.FRONTEND_URL}/login?error=authentication_failed`
    );
  }
};
