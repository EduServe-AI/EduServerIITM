import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { MessageIntent } from "../types/message";
import { classifyMessageIntent } from "../utils/classifyIntent";
import { buildDynamicUserTurn, createStaticSystemPrompt, Embedder, formatContext } from "../utils/llm";
import { findSimilarChunks } from "./knowledgeBase.service";

type Chat = import("../models/chat.model").default;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface SourceLink {
  filename: string;
  url: string | null;
}

export const prepareLLMChat = async (chat: Chat, userMessage: string, courseTitle: string) => {
  if (!chat || !chat.bot) {
    throw new Error("Chat Id with bot info is required");
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

  const intent : MessageIntent = classifyMessageIntent(userMessage)
  const needscontext = intent === "subject_query"


  let contextText = ""
  let sourceLinks : SourceLink[] = []

  if (needscontext){

    // Only hitting the embedding Api and vector DB when actually needed
    // Generating the embeddings for users query
    const userQueryEmbedding = await Embedder(userMessage, "query");

    // Retrieving the relevant contexts
    const courseId = chat.bot.courseId;
    if (!courseId) {
      throw new Error("Bot courseId is required for context retrieval");
    }

    const contextChunks = await findSimilarChunks(userQueryEmbedding, courseId);
    const contextResult = await formatContext(contextChunks);

    contextText = contextResult.contextText
    sourceLinks = contextResult.sourceLinks
  }

  // -------------------------------------------------------------------------
  // 1. Build the STATIC system prompt (cache-optimal — never changes per turn)
  // -------------------------------------------------------------------------
  const systemPrompt = await createStaticSystemPrompt(
    chat.botId,
    courseTitle,
    user.username!,
    intent          // passing intent so prompt adapts tone
  );

  // -------------------------------------------------------------------------
  // 2. Build the DYNAMIC final user message
  //    Context chunks go here so the system prompt stays a stable prefix.
  // -------------------------------------------------------------------------
  const finalUserContent = buildDynamicUserTurn(userMessage, contextText || undefined);

  const stream = groq.chat.completions.create({ 
    model: "openai/gpt-oss-20b",
    temperature: 0.5,
    stream: true,
    messages: [
      { role: "system" as const, content: systemPrompt },
      ...(messageHistory as Array<{
        role: "user" | "assistant";
        content: string;
      }>),
      { role: "user", content: finalUserContent },
    ],
  });

  return { stream: await stream, sourceLinks };
};
