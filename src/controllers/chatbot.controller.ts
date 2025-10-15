import { Request, Response } from "express";
import Responder from "../utils/responder";
import Bots from "../models/bot.model";

const featuredChatBotsId = [
  "76441b17-1a55-4600-97bd-9ced218b2490",
  "b2274158-6625-47f7-81de-b59cfbc43018",
  "96cbf19f-66f0-422f-87a3-4ca1e5768a68",
  "464c2262-7034-4ec6-843f-fc5875afe798",
];

export const featuredChatBotController = async (
  req: Request,
  res: Response
) => {
  try {
    const featuredChatBots = await Bots.findAll({
      where: {
        id: featuredChatBotsId,
      },
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
      data: {
        featuredChatBots,
      },
      httpCode: 200,
    });
  } catch (error) {
    console.error(error);
    return Responder(res, {
      error: "Internal Server Error",
      message: "An unexpected error occurred on the server.",
      httpCode: 500,
    });
  }
};
