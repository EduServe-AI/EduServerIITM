import { GoogleGenerativeAI } from "@google/generative-ai";
import Chats from "../models/chat.model";
import Groq from "groq-sdk";
import { createSystemPrompt } from "../utils/llm";

type Chat = import("../models/chat.model").default;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const prepareLLMChat = async (chat: Chat, userMessage: string) => {
  if (!chat) {
    throw new Error("Chat Id required");
  }

  const user = chat.user;

  if (!user) {
    throw new Error("User Required bro");
  }

  const messageHistory = chat.messages?.map((msg) => ({
    role: msg.sender === "user" ? "user" : ("assistant" as const),
    content: msg.content,
  }));

  if (!messageHistory) {
    throw new Error("No message history found");
  }

  const systemPrompt = await createSystemPrompt(chat.botId, user.username!);

  return groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    temperature: 0.5,
    stream: true,
    messages: [
      { role: "system" as const, content: systemPrompt },
      ...(messageHistory as Array<{
        role: "user" | "assistant";
        content: string;
      }>),
      { role: "user", content: userMessage },
    ],
  });
};
