import { Request, Response } from "express";
import Bots from "../models/bot.model";
import Course from "../models/course.model";
import Enrollment from "../models/enrollment.model";
import Responder from "../utils/responder";

/* ---------------------- FEATURED CHATBOTS ---------------------- */

export const featuredChatBotController = async (
  req: Request,
  res: Response
) => {
  try {
    const featuredChatBots = await Bots.findAll({
      where: { is_featured: true },
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

    if (!studentId) {
      return Responder(res, {
        error: "Unauthorized",
        message: "User not authenticated.",
        httpCode: 401,
      });
    }

    // const enrollments = await Enrollment.findAll({
    //   where: { userId: studentId, status: "enrolled" },
    //   attributes: ["courseId"],
    // });

    // if (enrollments.length === 0) {
    //   return Responder(res, {
    //     message: "No enrolled courses found for this student.",
    //     httpCode: 404,
    //   });
    // }

    // const courseIds = enrollments.map((enroll) => enroll.courseId);

    const recommendedBots = await Bots.findAll({
      include: [
        {
          model: Course,
          as: "course",
          required: true,
          include: [
            {
              model: Enrollment,
              required: true,
              as: "enrollments",
              where: { userId: studentId, status: "enrolled" },
              attributes: [],
            },
          ],
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

// -------------------- Making a chatbot Featured (temporary)-----------------------------------
export const makeBotFeaturedController = async (
  req: Request,
  res: Response
) => {
  try {
    const { botName } = req.body;

    console.log("botname", botName);
    if (!botName) {
      return Responder(res, {
        error: "Bot Name required",
        httpCode: 404,
      });
    }

    const bot = await Bots.findOne({ where: { name: botName } });

    if (!bot) {
      return Responder(res, {
        error: "Bot Not Found with the given id",
        httpCode: 404,
      });
    }

    await bot.update({ is_featured: true });
    await bot.save();

    return Responder(res, {
      message: "Made the Bot Featured",
      httpCode: 200,
      data: bot,
    });
  } catch (error) {
    console.error("Error making chatbot featured ", error);
    return Responder(res, {
      error: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred on the server.",
      httpCode: 500,
    });
  }
};
