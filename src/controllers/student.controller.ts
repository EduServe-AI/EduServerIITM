import { Request, Response } from "express";
import Course from "../models/course.model";
import User from "../models/user.model";
import Responder from "../utils/responder";

export const getStudentDataController = async (req: Request, res: Response) => {
  try {
    // Retreiving the user data from the users table
    const student = await User.findByPk(req.userId, {
      attributes: ["id", "username", "email", "role", "level"],
      include: [
        {
          model: Course,
          attributes: ["id", "name", "description"],
          as: "courses",
          through: {
            attributes: [],
          },
        },
      ],
    });

    if (!student) {
      return Responder(res, {
        error: "Student Not Found",
        httpCode: 404,
      });
    }

    return Responder(res, {
      message: "success",
      data: {
        student: student,
      },
      httpCode: 200,
    });
  } catch (error) {
    console.error("Error in getting the student data", error);
    return Responder(res, {
      error: "An unexpected error occurred while fetching student data.",
      message: "InternaL Server Error",
      httpCode: 500,
    });
  }
};
