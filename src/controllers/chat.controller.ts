import { Content, GoogleGenAI } from "@google/genai";
import { Request, Response } from "express";
import Bots from "../models/bot.model";
import Chats from "../models/chat.model";
import ChatMessages from "../models/chatMessage.model";
import Courses from "../models/course.model";
import User from "../models/user.model";
// OLD: Groq-based RAG approach (commented out)
// import { prepareLLMChat } from "../services/chat.service";
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

// ────────────────────────────────────────────────────────────
// Gemini + File Search Store Configuration
// ────────────────────────────────────────────────────────────

// Initialize the new @google/genai SDK for File Search support
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Map of bot/course names to their File Search Store names
// Add more entries here as you create stores for other courses
const FILE_SEARCH_STORE_MAP: Record<string, string> = {
  "Maths-I": "fileSearchStores/maths1-store-0e9mplfcwwfr",
  "PDSA": "fileSearchStores/pdsa-store-la0ns6d5zayf",
};

/**
 * Creates a system prompt for the Gemini model.
 * Unlike the old RAG approach, we do NOT inject context chunks here —
 * the File Search tool handles retrieval automatically.
 */
const createGeminiSystemPrompt = (
  botName: string,
  botDescription: string,
  courseTitle: string,
  username: string
): string => {
  return `You are "${botName} bot", an expert AI Tutor for the subject "${courseTitle}" for the BS Degree in Data Science and Applications Programme by IIT Madras.

Your Personality and Description:

<DESCRIPTION>
${botDescription}

You are friendly, encouraging, and supportive.
</DESCRIPTION>

You are interacting with the student named ${username}.

<Instructions>

1. **Answering**: Your answers must be precise, accurate, and broken down into short, easy-to-understand steps. Use numbered lists or bullet points to explain complex topics.
2. **Domain**: You must *only* answer questions related to your subject, "${botName}", and the IITM BS programme. Do not answer general knowledge questions, questions about other subjects, or personal opinions.
3. **Context**: Use the File Search tool results to ground your answers in the course material. Prioritize information from the retrieved documents over your general knowledge.
4. **Citation**: At the end of your answer, you MUST cite the source document your answer was based on. List them under a 'Sources:' heading.
5. **Out-of-Domain Response**: If the user asks a question outside your domain, you must politely decline. You can be slightly humorous.

</Instructions>

### Example Out-of-Domain Responses ###:
- That's an interesting question, ${username}! But my circuits are all wired for ${botName}.
- Whoa, that's way outside my knowledge base! I'm just a humble bot for ${botName}. Can we get back to that?
- Sorry, ${username}, that's not in my syllabus! Let's stick to ${botName}.
`;
};

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

    // ────────────────────────────────────────────────────────
    // NEW: Gemini + File Search Store approach
    // ────────────────────────────────────────────────────────

    // Build the system prompt (no manual RAG context injection needed)
    const systemPrompt = createGeminiSystemPrompt(
      bot.name,
      bot.description,
      course.title,
      user.username
    );

    // Build conversation history in Gemini Content[] format
    const conversationHistory: Content[] = (chat.messages || []).map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Add the new user message
    conversationHistory.push({
      role: "user",
      parts: [{ text: userMessage.content }],
    });

    // Determine which File Search Store to use based on the bot name
    const fileSearchStoreName = FILE_SEARCH_STORE_MAP[bot.name];

    // Build the tools array — include File Search if a store exists for this bot
    const tools: any[] = [];
    if (fileSearchStoreName) {
      tools.push({
        fileSearch: {
          fileSearchStoreNames: [fileSearchStoreName],
        },
      });
      console.log(
        `📚 Using File Search Store: ${fileSearchStoreName} for bot: ${bot.name}`
      );
    } else {
      console.log(
        `⚠️ No File Search Store mapped for bot: ${bot.name}. Proceeding without RAG.`
      );
    }

    // Call Gemini with streaming + File Search tool
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: conversationHistory,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.5,
        tools: tools.length > 0 ? tools : undefined,
      },
    });

    // Set headers for streaming
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    let fullBotResponse = ""; // Accumulate the full response

    for await (const chunk of stream) {
      // Extract text from the Gemini response chunk
      const chunkText = chunk.text || "";
      if (chunkText) {
        res.write(chunkText); // Send the chunk immediately to the client
        fullBotResponse += chunkText; // Add to the full response
      }
    }

    // ────────────────────────────────────────────────────────
    // OLD: Groq-based RAG approach (commented out)
    // ────────────────────────────────────────────────────────
    // const stream = await prepareLLMChat(chat, userMessage.content, course.title);
    //
    // res.setHeader("Content-Type", "text/plain");
    // res.setHeader("Transfer-Encoding", "chunked");
    //
    // let fullBotResponse = "";
    //
    // for await (const chunk of stream) {
    //   const chunkText = chunk.choices[0]?.delta?.content || "";
    //   res.write(chunkText);
    //   fullBotResponse += chunkText;
    // }
    // ────────────────────────────────────────────────────────

    // 6. Once streaming is done, end the response
    res.end();

    //7 . Saving the full bot response to the database
    if (fullBotResponse) {
      await ChatMessages.create({
        id: botMessage.id,
        botId: chat.botId,
        sender: "bot",
        content: fullBotResponse,
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
  // Checking the user
  const user = await User.findByPk(req.userId, {
    include: [
      {
        model: Chats,
        as: "chats",
        attributes: [
          "id",
          "botId",
          "botName",
          "title",
          "lastInteractionTime",
          "createdAt",
        ],
        order: [["lastInteractionTime", "DESC"]],
        limit: 7,
      },
    ],
  });

  if (!user || !user.username) {
    return Responder(res, {
      message: "User not found",
      httpCode: 404,
    });
  }

  try {
    const userChats = user.chats?.sort();

    if (!userChats || userChats.length === 0) {
      return Responder(res, {
        message: "User has no chats",
        httpCode: 404,
      });
    }

    return Responder(res, {
      message: "User Chats Retreived successfully",
      data: {
        chats: userChats,
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
