import { Request, Response } from "express";
import Responder from "../utils/responder";
import { findUserById } from "../services/user.service";
import Level from "../models/level.model";

export const getLevelsList = async (req: Request, res: Response) => {
  try {
    // getting the user by id
    const user = await findUserById(req.userId!);

    if (!user) {
      return Responder(res, {
        message: "User not found",
        httpCode: 404,
      });
    }

    const levels = await Level.findAll();

    if (levels.length <= 0) {
      return Responder(res, {
        error: "No levels exist",
        httpCode: 404,
      });
    }

    return Responder(res, {
      message: "Levels Data Fetched Successfully",
      data: {
        levels,
      },
    });
  } catch (error) {
    console.error("Error in getting list of levels");
    return Responder(res, {
      error: error,
      httpCode: 500,
    });
  }
};
