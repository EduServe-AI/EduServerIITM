import Bots from "../models/bot.model";
import Chats from "../models/chat.model";
import { findUserById } from "../services/user.service";
import Responder from "../utils/responder";
import { Request, Response } from "express";

export const createChatController = async (req: Request, res: Response) => {
  try {
    // Checking the user
    const user = await findUserById(req.userId!);

    if (!user) {
      return Responder(res, {
        message: "User not found",
        httpCode: 404,
      });
    }

    const { botId } = req.body;

    if (!botId) {
      return Responder(res, {
        error: "Required BotId",
        httpCode: 404,
      });
    }

    const bot = await Bots.findByPk(botId);

    if (!bot) {
      return Responder(res, {
        error: "Bot with the given Id not found",
        httpCode: 404,
      });
    }

    const createdChat = await Chats.create({
      botId: bot.id,
      botName: bot.name,
      chatId: crypto.randomUUID(),
      userId: user.id,
    });

    return Responder(res, {
      message: "Chat Created Successfully",
      httpCode: 201,
      data: createdChat,
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
