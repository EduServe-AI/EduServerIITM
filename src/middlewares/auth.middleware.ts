import { Request, Response, NextFunction } from "express";
import Responder from "../utils/responder";
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "../types/jwt";
import { findUserById } from "../services/user.service";

export default async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return Responder(res, {
      message: "Access Token Missing or Invalid",
      httpCode: 401,
    });
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    // Verify the access token
    const decoded = verifyToken(accessToken, "access") as JwtPayload;

    req.userId = decoded.userId;
    req.userRole = decoded.role;

    const user = await findUserById(req.userId);

    if (!user) {
      return Responder(res, {
        message: "User not found",
        httpCode: 404,
      });
    }

    next();
  } catch (error: any) {
    console.log(`Internal Server Error ${error}`);
    return Responder(res, {
      error: error.message,
      httpCode: 401,
    });
  }
};
