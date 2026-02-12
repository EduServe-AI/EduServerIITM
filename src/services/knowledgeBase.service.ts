import pgvector from "pgvector";
import { QueryTypes } from "sequelize";
import sequelize from "../config/db.config";

interface chunkType {
  content: string;
  embedding: number[];
  course_id: string;
  source_filename: string;
  week_number?: number | null;
}

// SQL Query to create the knowledge base table
const CREATE_KNOWLEDGEBASE_SQLSCRIPT = `

    CREATE TABLE IF NOT EXISTS "knowledgeBase" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "content" TEXT NOT NULL,
        "embedding" vector(768) NOT NULL,
        "course_id" UUID NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
        "source_filename" VARCHAR(255) NOT NULL,
        "week_number" INTEGER
    )
`;

// SQL Query to count the number of rows
const COUNT_EMBEDDINGS = `
    SELECT COUNT(*)
    FROM "knowledgeBase";
`;

// SQL Query to count the number of rows of a particular course
const COUNT_COURSE_EMBEDDINGS = `
    SELECT COUNT(*)
    FROM "knowledgeBase"
    WHERE 
`;

// SQL Query to insert the chunk into knowledge base
const INSERT_CHUNK = `
     INSERT INTO "knowledgeBase" (id , content , embedding , course_id , source_filename , week_number)
     VALUES (
       gen_random_uuid(),
       :content,
       :embedding,
       :course_id,
       :source_filename,
       :week_number
     )
`;

// SQL Query to retreive the chunk from the knowledgeBase
const RETREIVE_CHUNK = `

      SELECT content , source_filename
      FROM "knowledgeBase"
      WHERE "course_id" = :courseId
      ORDER BY "embedding" <=> :embedding
      LIMIT :limit

`;

export const initializeKnowledgeBase = async () => {
  try {
    await sequelize.query(CREATE_KNOWLEDGEBASE_SQLSCRIPT);
  } catch (error: any) {
    console.error("❌ Error initializing knowledge_base table: ", error);
    throw new Error(error);
  }
};

export const countKnowledgeBaseRows = async () => {
  try {
    const [results, metadata] = await sequelize.query(COUNT_EMBEDDINGS);

    if (results && results.length > 0) {
      const countRow = results[0] as { count: string };
      return parseInt(countRow.count, 10);
    }
    return 0;
  } catch (error: any) {
    console.error(
      "❌ Error in counting rows of  knowledge_base table: ",
      error,
    );
    throw new Error(error);
  }
};

export const countCourseKnowledgeBaseRows = async (courseId: string) => {
  try {
    const COUNT_COURSE_EMBEDDINGS = `
      SELECT COUNT(*) as count
      FROM "knowledgeBase" 
      WHERE course_id = :courseId
    `;

    const [results, metadata] = await sequelize.query(COUNT_COURSE_EMBEDDINGS, {
      replacements: { courseId },
    });

    if (results && results.length > 0) {
      const countRow = results[0] as { count: string };
      return parseInt(countRow.count, 10);
    }
    return 0;
  } catch (error: any) {
    console.error("❌ Error in counting rows of knowledge_base table: ", error);
    throw new Error(error);
  }
};

export const insertKnowledgeChunk = async (chunk: chunkType) => {
  // Formatting the embedding vector for a raw sql query
  const embeddingSql = pgvector.toSql(chunk.embedding);

  try {
    await sequelize.query(INSERT_CHUNK, {
      replacements: {
        content: chunk.content,
        embedding: embeddingSql,
        course_id: chunk.course_id,
        source_filename: chunk.source_filename,
        week_number: chunk.week_number,
      },
    });
  } catch (error: any) {
    console.error(
      "❌ Error in inserting chunks into knowledge_base table: ",
      error,
    );
    throw new Error(error);
  }
};

export const findSimilarChunks = async (
  embedding: number[],
  courseId: string,
  limit: number = 5,
) => {
  // Formatting the embedding vector for a raw sql query
  const embeddingSql = pgvector.toSql(embedding);

  try {
    const results = await sequelize.query(RETREIVE_CHUNK, {
      replacements: {
        courseId: courseId,
        embedding: embeddingSql,
        limit: limit,
      },
      type: QueryTypes.SELECT,
    });

    console.log("retreived chunks", results);

    return results as { content: string; source_filename: string }[];
  } catch (error: any) {
    console.error("❌ Error in retreiving chunks from knowledge_base ", error);
    throw new Error(error);
  }
};
