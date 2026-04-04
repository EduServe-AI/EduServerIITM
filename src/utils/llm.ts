import { TaskType } from "@google/generative-ai";
import { AzureBlobStorageFileLoader } from "@langchain/community/document_loaders/web/azure_blob_storage_file";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import config from "../config/constants";
import Bots from "../models/bot.model";

export const createSystemPrompt = async (
  botId: string,
  courseTitle : string,
  username: string,
  contextText: string,
  sourcesString: string
) => {
  const bot = await Bots.findByPk(botId);

  if (!bot) throw new Error("Bot Not Found brother");

  let prompt = ` You are "${bot.name} bot " , an expert AI Tutor at the subject ${courseTitle} for the  BS Degree in Data Science and Applications Programme by IIT Madras . 

  Your Personality and Description :

  <DESCRIPTION>
  \n${bot.description}

  You are friendly , encouraging , 
  </DESCRIPTION>

  You are interacting with the student named ${username}


  <Instructions>

  - 1 . **Answering** : Your answers must be precise, accurate, and broken down into short, easy-to-understand steps. Use numbered lists or bullet points to explain complex topics.
  - 2. **Domain** : You must *only* answer questions related to your subject, "${bot.name}", and the IITM BS programme. Do not answer general knowledge questions, questions about other subjects, or personal opinions.
  - 3. **Context** : Use your answers on the provided context chunks below by considering relevant chunks . Reduce the usage of outside knowledge.
  - 4. **Citation** : At the end of your answer, you MUST cite the source filename your answer was based on. List them under a 'Sources:' heading.
  - 5. **Out-of-Domain Response:** If the user asks a question outside your domain, you must politely decline. You can be slightly humorous.

  </Instructions>

  \n### Context Chunks ### :
  ${contextText}

  "\n### Available Source(s) for Citation ###",
    // This tells the AI what filenames it is allowed to cite
    ${sourcesString},

   
  \n### Example Out-of-Domain Responses ### :
   - That's an interesting question, ${username}! But my circuits are all wired for ${bot.name}.
   - Whoa, that's way outside my knowledge base! I'm just a humble bot for ${bot.name}. Can we get back to that?
   - Sorry, ${username}, that's not in my syllabus! Let's stick to ${bot.name}.

  `;

  return prompt;
};

export const Embedder = async (content: string, type: "document" | "query") => {
  const taskType =
    type === "document"
      ? TaskType.RETRIEVAL_DOCUMENT
      : TaskType.RETRIEVAL_QUERY;

  const embedder = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001", // 768 dimensions
    apiKey: process.env.GEMINI_API_KEY,
    taskType: taskType,
  });

  return embedder.embedQuery(content);
};

export const documentLoader = async (courseName: string, blobName?: string) => {
  // const loader = new AzureBlobStorageContainerLoader({
  //   azureConfig: {
  //     connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING!,
  //     container: "slides",
  //     prefix: `/${courseName}/`,
  //   },
  // unstructuredConfig: {
  //   apiUrl:
  //     config.nodeEnv === "development"
  //       ? config.DOCKER_UNSTRUCTURED_URL
  //       : config.PROD_UNSTRUCTURED_URL,
  //   apiKey:
  //     config.nodeEnv === "development" ? "" : config.PROD_UNSTRUCTURED_KEY,
  //   strategy: "hi_res",
  //   chunkingStrategy: "by_title",
  //   skipHeadersAndFooters: true,
  // } as any,
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
    } as any,
  });

  return loader;
};

export const formatContext = async (
  contextChunks: {
    content: string;
    source_filename: string;
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

  // Extracting a unique list of source files
  const sourceFiles = [
    ...new Set(contextChunks.map((chunk) => chunk.source_filename)),
  ];
  const sourcesString = sourceFiles.join(", ");

  return { contextText, sourcesString };
};
