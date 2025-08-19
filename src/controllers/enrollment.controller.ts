import { Request, Response } from "express";
import Responder from "../utils/responder";
import { findUserById } from "../services/user.service";
import Enrollment from "../models/enrollment.model";
import Course from "../models/course.model";
import { getCurrentTerm } from "../services/enrollment.service";
import { CourseStatus } from "../types/enrollment";

export const getEnrollmentsList = async (req: Request, res: Response) => {
  try {
    // getting the user by id
    const user = await findUserById(req.userId!);

    if (!user) {
      return Responder(res, {
        message: "User not found",
        httpCode: 404,
      });
    }

    const enrollments = await Enrollment.findAll();

    if (enrollments.length <= 0) {
      return Responder(res, {
        error: "No enrollments exist",
        httpCode: 404,
      });
    }

    return Responder(res, {
      message: "Enrollments Data Fetched Successfully",
      data: {
        enrollments,
      },
    });
  } catch (error) {
    console.error(`Error in fetching enrollments ${error}`);
    return Responder(res, {
      error: error,
      httpCode: 500,
    });
  }
};

export const addCourses = async (req: Request, res: Response) => {
  try {
    const { selected_courses } = req.body;

    console.log("Selected_courses", selected_courses);

    const user = await findUserById(req.userId!);

    if (!user) {
      return Responder(res, {
        message: "User not found",
        httpCode: 404,
      });
    }

    if (
      !selected_courses ||
      !Array.isArray(selected_courses) ||
      selected_courses.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "selected_courses is required and must be a non-empty array",
      });
    }

    const { currentTerm, currentYear } = getCurrentTerm();

    const courses = await Course.findAll({
      where: {
        name: selected_courses,
      },
    });

    console.log("courses", courses);

    if (courses.length !== selected_courses.length) {
      return res.status(400).json({
        success: false,
        message: "Some courses not found in database",
      });
    }

    const course_enrollments = courses.map((course) => ({
      userId: user.id,
      courseId: course.id,
      term: currentTerm,
      year: currentYear,
      status: "enrolled" as CourseStatus,
    }));

    const enrollments = await Enrollment.bulkCreate(course_enrollments, {
      ignoreDuplicates: true,
      returning: true,
    });

    return Responder(res, {
      message: "Courses enrolled successfully",
      data: {
        enrollments,
      },
    });
  } catch (error) {
    console.error(`Error in enrolling courses ${error}`);
    return Responder(res, {
      error: error,
      httpCode: 500,
    });
  }
};

export const userEnrollments = async (req: Request, res: Response) => {
  try {
    const user = await findUserById(req.userId!);

    if (!user) {
      return Responder(res, {
        message: "User not found",
        httpCode: 404,
      });
    }

    const user_enrollments = await Enrollment.findAll({
      where: {
        userId: user.id,
      },
    });

    return Responder(res, {
      message: "User enrollments fetched",
      data: {
        user_enrollments,
      },
    });
  } catch (error) {
    console.error(`Error in getting user course enrollments ${error}`);
    return Responder(res, {
      error: error,
      httpCode: 500,
    });
  }
};
