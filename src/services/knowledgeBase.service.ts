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

// Cosine distance threshold — chunks with distance >= this value are too
// dissimilar to be useful and are excluded. 0.65 means ≤ 35% similarity.
const SIMILARITY_THRESHOLD = 0.65;

// SQL Query to retrieve chunks from knowledgeBase with LEFT JOIN on document_links
// Only returns chunks whose cosine distance is below the threshold (i.e. actually relevant).
const RETRIEVE_CHUNK = `
      SELECT 
        kb.content,
        kb.source_filename,
        dl."documentUrl" AS document_url,
        (kb."embedding" <=> :embedding) AS similarity_score
      FROM "knowledgeBase" kb
      LEFT JOIN "document_links" dl
        ON dl."courseId" = kb."course_id"
        AND dl."sourceFilename" = kb."source_filename"
      WHERE kb."course_id" = :courseId
        AND (kb."embedding" <=> :embedding) < :threshold
      ORDER BY kb."embedding" <=> :embedding
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
      error
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
      error
    );
    throw new Error(error);
  }
};

export const findSimilarChunks = async (
  embedding: number[],
  courseId: string,
  limit: number = 10
) => {
  // Formatting the embedding vector for a raw sql query
  const embeddingSql = pgvector.toSql(embedding);

  try {
    const results = await sequelize.query(RETRIEVE_CHUNK, {
      replacements: {
        courseId: courseId,
        embedding: embeddingSql,
        limit: limit,
        threshold: SIMILARITY_THRESHOLD,
      },
      type: QueryTypes.SELECT,
    });

    const chunks = results as {
      content: string;
      source_filename: string;
      document_url: string | null;
      similarity_score: number;
    }[];

    // Log retrieval stats for observability
    if (chunks.length === 0) {
      console.warn(`⚠️  RAG: No chunks met the similarity threshold (< ${SIMILARITY_THRESHOLD}) for course ${courseId}`);
    } else {
      const scores = chunks.map((c) => c.similarity_score.toFixed(3)).join(", ");
      console.log(`📚 RAG: Retrieved ${chunks.length} chunks. Scores (lower = better): [${scores}]`);
    }

    return chunks;
  } catch (error: any) {
    console.error("❌ Error in retreiving chunks from knowledge_base ", error);
    throw new Error(error);
  }
};
