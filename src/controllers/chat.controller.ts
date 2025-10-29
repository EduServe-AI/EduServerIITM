import Bots from "../models/bot.model";
import Chats from "../models/chat.model";
import ChatMessages from "../models/chatMessage.model";
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

export const getChatController = async (req: Request, res: Response) => {
  try {
    // Checking the user
    const user = await findUserById(req.userId!);

    if (!user) {
      return Responder(res, {
        message: "User not found",
        httpCode: 404,
      });
    }

    // Retreiving the chatId from the params
    const { chatId } = req.params;
    if (!chatId) {
      return Responder(res, { error: "Chat ID is required", httpCode: 400 });
    }

    const chat = await Chats.findByPk(chatId, {
      attributes: ["id", "botId", "botName", "title", "userId"],
      include: [
        { model: Bots, as: "bot" },
        {
          model: ChatMessages,
          as: "messages",
          attributes: [
            "content",
            "username",
            "sender",
            "rating",
            "isDeleted",
            "createdAt",
          ],
          order: [
            ["createdAt", "ASC"], // Order messages chronologically
          ],
        },
      ],
    });

    if (!chat) {
      console.error("chat error", chat);
      return Responder(res, {
        error: "Chat session not found or access denied",
        httpCode: 404,
      });
    }

    // 3. Prepare chat details including the bot's name
    const chatDetails = {
      id: chat.id,
      botId: chat.botId,
      botName: chat.bot?.name || "Unknown Bot", // Safely access bot name
      userId: chat.userId,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      title: chat.title,
    };

    return Responder(res, {
      message: "Chat Session Retreievs Successfully",
      data: {
        chat: chatDetails,
        messages: chat.messages,
      },
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
