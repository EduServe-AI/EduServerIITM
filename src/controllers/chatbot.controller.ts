import { Request, Response } from "express";
import Responder from "../utils/responder";
import Bots from "../models/bot.model";
import Enrollment from "../models/enrollment.model";
import Course from "../models/course.model";

/* ---------------------- FEATURED CHATBOTS ---------------------- */
const featuredChatBotsId = [
  "504e5cb2-2002-445b-8b51-05c066483149",
  "9da92dac-8b29-4506-b1ae-a4c0391c1506",
  "98be0433-5156-488e-bac7-1a9286230227",
];

export const featuredChatBotController = async (
  req: Request,
  res: Response
) => {
  try {
    const featuredChatBots = await Bots.findAll({
      where: { id: featuredChatBotsId },
      attributes: ["id", "name", "description", "level", "numInteractions"],
    });

    if (featuredChatBots.length === 0) {
      return Responder(res, {
        error: "No Featured ChatBots",
        httpCode: 400,
      });
    }

    return Responder(res, {
      message: "Featured chatbots fetched successfully",
      data: { featuredChatBots },
      httpCode: 200,
    });
  } catch (error) {
    console.error(error);
    return Responder(res, {
      error: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred on the server.",
      httpCode: 500,
    });
  }
};

/* ------------------- RECOMMENDED CHATBOTS ------------------- */
export const recommendedChatBotController = async (
  req: Request,
  res: Response
) => {
  try {
    const studentId = req.userId;
    console.log("Student ID:", studentId);

    if (!studentId) {
      return Responder(res, {
        error: "Unauthorized",
        message: "User not authenticated.",
        httpCode: 401,
      });
    }

    const enrollments = await Enrollment.findAll({
      where: { userId: studentId, status: "enrolled" },
      attributes: ["courseId"],
    });

    if (enrollments.length === 0) {
      return Responder(res, {
        message: "No enrolled courses found for this student.",
        httpCode: 404,
      });
    }

    const courseIds = enrollments.map((enroll) => enroll.courseId);

    const recommendedBots = await Bots.findAll({
      where: { courseId: courseIds },
      attributes: ["id", "name", "description", "level", "numInteractions"],
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "name", "description"],
        },
      ],
    });

    if (recommendedBots.length === 0) {
      return Responder(res, {
        message: "No recommended chatbots found for enrolled courses.",
        httpCode: 404,
      });
    }

    return Responder(res, {
      message: "Recommended chatbots fetched successfully.",
      data: { recommendedBots },
      httpCode: 200,
    });
  } catch (error) {
    console.error("Error fetching recommended chatbots:", error);
    return Responder(res, {
      error: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred on the server.",
      httpCode: 500,
    });
  }
};
