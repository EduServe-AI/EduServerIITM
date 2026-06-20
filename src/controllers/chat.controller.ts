import { GoogleGenerativeAI } from "@google/generative-ai";
import { Request, Response } from "express";
import sequelize from "../config/db.config";
import Bots from "../models/bot.model";
import Chats from "../models/chat.model";
import ChatMessages from "../models/chatMessage.model";
import Courses from "../models/course.model";
import User from "../models/user.model";
import { prepareLLMChat } from "../services/chat.service";
import { findUserById } from "../services/user.service";
import Responder from "../utils/responder";

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

    // This means "A user has started a new interaction session with this bot"
    await Bots.increment("numInteractions", { where: { id: botId } });

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
            "id",
            "content",
            "sources",
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

    // 4. Clean up messages: strip ___SOURCES_JSON___ from content
    //    and return sources as `sourceLinks` (matching the frontend interface)
    const SOURCES_DELIMITER = "\n___SOURCES_JSON___\n";
    const cleanedMessages = (chat.messages || []).map((msg) => {
      const plain = msg.toJSON();

      // Always strip the ___SOURCES_JSON___ block from content so the
      // raw JSON is never shown to the user, regardless of whether
      // sources also live in the dedicated JSONB column.
      const delimIdx = plain.content.indexOf(SOURCES_DELIMITER);
      if (delimIdx !== -1) {
        const rawJson = plain.content.slice(delimIdx + SOURCES_DELIMITER.length);
        plain.content = plain.content.slice(0, delimIdx);

        // If the dedicated `sources` column is empty, recover from content
        if (!plain.sources) {
          try {
            const parsed = JSON.parse(rawJson);
            plain.sources = parsed.sources || null;
          } catch {
            plain.sources = null;
          }
        }
      }

      // Rename `sources` → `sourceLinks` to match the frontend chatMessage interface
      const { sources, ...rest } = plain;
      return {
        ...rest,
        sourceLinks: sources || null,
      };
    });

    return Responder(res, {
      message: "Chat Session Retreievs Successfully",
      data: {
        chat: chatDetails,
        messages: cleanedMessages,
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

// --- Initialize Gemini ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const generateResponseController = async (
  req: Request,
  res: Response
) => {
  // Checking the user
  const user = await findUserById(req.userId!);

  if (!user || !user.username) {
    return Responder(res, {
      message: "User not found",
      httpCode: 404,
    });
  }

  // Retreiving the chatId from the params
  const { chatId } = req.params;
  console.log("chatId", chatId);
  if (!chatId) {
    return Responder(res, { error: "Chat ID is required", httpCode: 404 });
  }

  const chat = await Chats.findByPk(chatId, {
    include: [
      {
        model: ChatMessages,
        as: "messages",
        order: [["createdAt", "ASC"]],
        limit: 10,
        attributes: ["id", "content", "rating", "sender"],
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "username"],
      },
      {
        model: Bots,
        as: "bot",
        attributes: ["id", "name", "courseId", "level", "numInteractions"],
      },
    ],
  });
  if (!chat) {
    return Responder(res, {
      error: "Chat with given ChatId not found",
      httpCode: 404,
    });
  }

  const bot = await Bots.findByPk(chat.botId);
  if (!bot) {
    return Responder(res, {
      error: "Associated bot not found",
      httpCode: 404,
    });
  }

  const course = await Courses.findByPk(bot.courseId);
  if (!course) {
    return Responder(res, {
      error: "Associated course not found",
      httpCode: 404,
    });
  }


  const { userMessage, botMessage } = req.body;

  if (!userMessage || !botMessage) {
    console.error("Missing User and Bot Messages");
    return Responder(res, {
      message: "Missing User and Bot Messages",
      httpCode: 404,
    });
  }

  try {
    // Now adding the users message in the database
    await ChatMessages.create({
      id: userMessage.id,
      botId: chat.botId,
      sender: userMessage.sender,
      content: userMessage.content,
      userId: user.id,
      chatId: chat.id,
      username: user.username,
      rating: 0,
    });

    // Helper function we pass chatId , and well get an LLM Object loaded with full context
    const { stream, sourceLinks } = await prepareLLMChat(chat, userMessage.content, course.title);

    console.log("source link", sourceLinks)

    // Set headers for streaming
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    let fullBotResponse = ""; // Accumulate the full response

    for await (const chunk of stream) {
      const chunkText = chunk.choices[0]?.delta?.content || "";
      res.write(chunkText); // Send the chunk immediately to the client
      fullBotResponse += chunkText; // Add to the full response
    }

    // Send source links as a JSON block after the stream using a delimiter
    // The frontend splits on this delimiter to extract the source metadata
    const sourcesPayload = JSON.stringify({ sources: sourceLinks });
    res.write(`\n___SOURCES_JSON___\n${sourcesPayload}`);

    // Once streaming is done, end the response
    res.end();

    // Saving the full bot response to the database
    if (fullBotResponse) {
      const hasSources = sourceLinks && sourceLinks.length > 0;

      // Build the content to persist. We embed sources inside the content
      // using the ___SOURCES_JSON___ delimiter so that getChatController's
      // fallback parser can always recover them on reload – even if the
      // dedicated `sources` JSONB column does not exist in the DB yet.
      let contentToSave = fullBotResponse;
      if (hasSources) {
        const sourcesPayloadForDb = JSON.stringify({ sources: sourceLinks });
        contentToSave += `\n___SOURCES_JSON___\n${sourcesPayloadForDb}`;
      }

      await ChatMessages.create({
        id: botMessage.id,
        botId: chat.botId,
        sender: "bot",
        content: contentToSave,
        sources: hasSources ? sourceLinks : null,
        userId: user.id,
        chatId: chat.id,
        username: user.username,
        rating: 0,
      });

      // Need to update the chats last interaction time
      chat.lastInteractionTime = new Date();
      await chat.save();

      // Need to activate the chat message if it is first message
      if (chat.isDeleted) {
        chat.isDeleted = false;
        await chat.save();
      }
    }
  } catch (error) {
    console.error("Error generating message:", error);
    // If we've already started streaming, we can't send a JSON error
    if (!res.headersSent) {
      console.error("Internal server error", error);
      return Responder(res, {
        message: "Internal Server Error",
        httpCode: 500,
      });
    } else {
      res.end(); // Just end the stream if an error happens mid-stream
    }
  }
};

export const getUserChatsController = async (req: Request, res: Response) => {
  try {
    // 1. Validate the user exists (only fetch the needed fields to save memory)
    const user = await User.findByPk(req.userId, {
      attributes: ["id", "username"],
    });

    if (!user || !user.username) {
      return Responder(res, {
        message: "User not found",
        httpCode: 404,
      });
    }

    // 2. Fetch chats directly from the Chats model
    // This generates a much cheaper and faster SQL query
    const userChats = await Chats.findAll({
      where: { userId: req.userId , isDeleted : false},
      attributes: [
        "id",
        "botId",
        "botName",
        "title",
        "lastInteractionTime",
        "createdAt",
      ],
      order: [
        [
          sequelize.fn(
            "COALESCE",
            sequelize.col("lastInteractionTime"),
            sequelize.col("createdAt")
          ),
          "DESC",
        ],
      ],
      limit: 7,
    });

    if (!userChats || userChats.length === 0) {
      return Responder(res, {
        message: "User has no chats",
        httpCode: 404,
      });
    }

    const chatsWithInteractionTime = userChats.map((chat) => {
      const plain = chat.toJSON() as any;
      return {
        ...plain,
        lastInteractionTime: plain.lastInteractionTime || plain.createdAt,
      };
    });

    return Responder(res, {
      message: "User Chats Retrieved successfully",
      data: {
        chats: chatsWithInteractionTime,
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


export const deleteChatController = async (req : Request , res : Response) => {
  try {

    // Retreiving the chatId from the params
    const { chatId } = req.params;
    console.log("chatId", chatId);
    if (!chatId) {
      return Responder(res, { error: "Chat ID is required for deleting", httpCode: 404 });
    } 


    const chat = await Chats.findByPk(chatId)

    if (!chat){
      return Responder(res , {
        error : "Chat With given Id not found" , httpCode : 404
      })
    }

    // First we need to mark the chat as deleted 
    chat.isDeleted = true;
    await chat.save(); 


    // Later we need to run a scheduler to soft delete chat messages 

    return Responder(res , {
      message : "Chat Deleted successfully", 
      httpCode : 200
    })

    
  } catch (error) {
    console.error(error);
    return Responder(res , {
      error : "INTERNAL SERVER ERROR",
      message : "An unexpected error occurred on the server.",
      httpCode : 500
    })
    
  }
}