import { GoogleGenAI } from "@google/genai";
import { TaskType } from "@google/generative-ai";
import { AzureBlobStorageFileLoader } from "@langchain/community/document_loaders/web/azure_blob_storage_file";
import config from "../config/constants";
import Bots from "../models/bot.model";
import { MessageIntent } from "../types/message";

// Initializing the google genai client
const googleGenAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * Creates the STATIC system prompt — identical every turn for the same
 * (bot, course, user) triple, so the LLM provider can cache it.
 *
 * ✅ Cache-optimal ordering:
 *   1. Role definition        — static
 *   2. Course / bot identity  — static
 *   3. Username               — static
 *   4. Formatting / domain rules — static
 *
 * Dynamic content (RAG context chunks) is intentionally NOT included here.
 * It is injected into the final user message via `buildDynamicUserTurn`.
 */
export const createStaticSystemPrompt = async (
  botId: string,
  courseTitle: string,
  username: string,
  intent?: MessageIntent
): Promise<string> => {
  const bot = await Bots.findByPk(botId);

  if (!bot) throw new Error("Bot Not Found brother");

  // Lightweight prompt for greetings — no RAG instructions needed
  if (intent && intent !== "subject_query") {
    return `You are a friendly AI tutor for ${courseTitle} on Eduserve AI.
The student's name is ${username}.
Respond naturally and warmly to their message.
Keep your response brief and conversational.
Do not bring up course content unless the student asks.`;
  }

  // Full subject-query prompt — static parts only
  return `You are "${bot.name} bot", an expert AI Tutor for the subject "${courseTitle}" in the BS Degree in Data Science and Applications Programme by IIT Madras.

Your Personality and Description:
<DESCRIPTION>
${bot.description}

You are friendly and encouraging.
</DESCRIPTION>

You are interacting with the student named ${username}.

<Instructions>
- 1. **Answering**: Your answers must be precise, accurate, and broken down into short, easy-to-understand steps. Use numbered lists or bullet points to explain complex topics.
- 2. **Domain**: You must *only* answer questions related to your subject, "${bot.name}", and the IITM BS programme. Do not answer general knowledge questions, questions about other subjects, or personal opinions.
- 3. **Context**: Base your answers on the context chunks provided in each user message. Reduce the usage of outside knowledge.
- 4. **Out-of-Domain Response**: If the user asks a question outside your domain, politely decline. You can be slightly humorous.
- 5. **Tree-type-responses**: When showing folder/file tree structures, always wrap them in a fenced code block tagged with language-filetree or language-tree.
</Instructions>

### Example Out-of-Domain Responses ###
- That's an interesting question, ${username}! But my circuits are all wired for ${bot.name}.
- Whoa, that's way outside my knowledge base! I'm just a humble bot for ${bot.name}. Can we get back to that?
- Sorry, ${username}, that's not in my syllabus! Let's stick to ${bot.name}.`;
};

/**
 * Builds the final user-turn content.
 *
 * For subject queries the DYNAMIC context chunks are prepended here —
 * this keeps the system prompt (and all prior history) as a stable,
 * cacheable prefix.  Only this last message changes every turn.
 */
export const buildDynamicUserTurn = (
  userMessage: string,
  contextText?: string
): string => {
  if (!contextText) return userMessage;

  return `### Relevant Context Chunks ###
${contextText}

### Student Question ###
${userMessage}`;
};

export const Embedder = async (
  content: string,
  type: "document" | "query",
): Promise<number[]> => {
  const taskType =
    type === "document"
      ? TaskType.RETRIEVAL_DOCUMENT
      : TaskType.RETRIEVAL_QUERY;

  const response = await googleGenAI.models.embedContent({
    model: "gemini-embedding-001",
    contents: content,
    config: {
      outputDimensionality: 768,
      taskType: taskType,
    },
  });

  if (!response.embeddings) {
    throw new Error("Failed to generate embeddings");
  }
  // Assuming response.embeddings is an array of numbers
  return response.embeddings[0].values as number[];
};


export const documentLoader = async (courseName: string, blobName?: string) => {
  const loader = new AzureBlobStorageFileLoader({
    azureConfig: {
      connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING!,
      container: "slides",
      blobName: blobName!,
    },
    unstructuredConfig: {
      apiUrl: config.PROD_UNSTRUCTURED_URL,
      apiKey: config.PROD_UNSTRUCTURED_KEY,
      chunkingStrategy: "by_title",
      skipHeadersAndFooters: true,
      // Keep section titles and their content together in the same chunk.
      // Default is ~500 chars which splits "Problem Statement:" from its body.
      maxCharacters: 2000,
      // Merge tiny fragments (< 500 chars) into the next chunk so we never
      // store a chunk that is just a heading with no body content.
      combineUnderNChars: 500,
      // Overlap between consecutive chunks so context at chunk boundaries
      // is not completely lost.
      overlap: 200,
    } as any,
  });

  return loader;
};

export const formatContext = async (
  contextChunks: {
    content: string;
    source_filename: string;
    document_url: string | null;
    similarity_score?: number;
  }[]
) => {
  const contextText = contextChunks
    .map(
      (chunk, index) => `
  -------
  [Context Chunk ${index + 1}]
  ${chunk.content}
  -------
  `
    )
    .join("\n");

  // Extracting a unique list of source files with their URLs
  const sourceMap = new Map<string, string | null>();
  contextChunks.forEach((chunk) => {
    // Only set if not already there, or update if this one has a URL
    if (!sourceMap.has(chunk.source_filename) || chunk.document_url) {
      sourceMap.set(chunk.source_filename, chunk.document_url);
    }
  });

  // Build sources string with URLs where available (for the LLM prompt)
  const sourcesString = Array.from(sourceMap.entries())
    .map(([filename, url]) => {
      if (url) {
        return `${filename} (URL: ${url})`;
      }
      return filename;
    })
    .join(", ");

  // Build explicit source links array (for the JSON response to frontend)
  const sourceLinks = Array.from(sourceMap.entries()).map(([filename, url]) => ({
    filename,
    url,
  }));

  return { contextText, sourcesString, sourceLinks };
};
