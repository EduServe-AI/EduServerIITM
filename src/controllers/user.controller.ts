import { Request, Response } from "express";
import Responder from "../utils/responder";
import { findUserById } from "../services/user.service";

export const updateUserController = async (req: Request, res: Response) => {
  try {
    // getting the updates from the req
    const updates = req.body;

    // getting the user by id
    const user = await findUserById(req.userId!);

    if (!user) {
      return Responder(res, {
        message: "User not found",
        httpCode: 404,
      });
    }

    const updatedUser = await user.update({ ...updates });

    return Responder(res, {
      message: "Updated user successfully",
      data: { updatedUser },
      httpCode: 200,
    });
  } catch (error) {
    console.error(error);
    return Responder(res, {
      error: error,
      message: "InternaL Server Error",
      httpCode: 500,
    });
  }
};
