import { Request, Response } from "express";
import Responder from "../utils/responder";
import { findUserById } from "../services/user.service";
import Course from "../models/course.model";
import User from "../models/user.model";

export const getCoursesList = async (req: Request, res: Response) => {
  try {
    // getting the user by id
    const user = await findUserById(req.userId!);

    if (!user) {
      return Responder(res, {
        message: "User not found",
        httpCode: 404,
      });
    }

    const courses = await Course.findAll();

    if (courses.length <= 0) {
      return Responder(res, {
        error: "No courses exist",
        httpCode: 404,
      });
    }

    return Responder(res, {
      message: "Courses Fetched Successfully",
      data: {
        courses,
      },
    });
  } catch (error) {
    console.log(`Error in getting courses list`);
    return Responder(res, {
      error: error,
      httpCode: 500,
    });
  }
};

export const getUserCourses = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.userId!, {
      include: [
        {
          model: Course,
          as: "courses",
          through: {
            attributes: ["term", "year", "status"],
          },
        },
      ],
    });

    if (!user) {
      return Responder(res, {
        message: "User not found",
        httpCode: 404,
      });
    }

    if (user.courses?.length === 0) {
      return Responder(res, {
        error: "Haven't added any courses in this term",
        httpCode: 404,
      });
    }

    return Responder(res, {
      message: "User enrollments retrieved successfully",
      data: user.courses,
    });
  } catch (error) {
    console.error(`Error in getting current user courses ${error}`);
    return Responder(res, {
      error: error,
      httpCode: 500,
    });
  }
};
