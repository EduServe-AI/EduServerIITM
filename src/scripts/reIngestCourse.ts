/**
 * Re-Ingest Course Embeddings Script
 *
 * Wipes all existing embeddings for a course and re-populates them
 * using the current documentLoader config (improved chunking settings).
 *
 * Usage:
 *   npx ts-node src/scripts/reIngestCourse.ts "<CourseName>"
 *
 * Example:
 *   npx ts-node src/scripts/reIngestCourse.ts "MAD-I Project"
 */

import { QueryTypes } from "sequelize";
import { BlobServiceClient } from "@azure/storage-blob";
import sequelize from "../config/db.config";
import { getCourseId } from "../services/course.service";
import { insertKnowledgeChunk } from "../services/knowledgeBase.service";
import { documentLoader, Embedder } from "../utils/llm";
import { getWeekNumber } from "../services/course.service";

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!
);
const containerClient = blobServiceClient.getContainerClient("slides");

const deleteEmbeddingsForCourse = async (courseId: string) => {
  const deleted = await sequelize.query(
    `DELETE FROM "knowledgeBase" WHERE "course_id" = :courseId`,
    { replacements: { courseId }, type: QueryTypes.DELETE }
  );
  console.log(`🗑️  Deleted existing embeddings for course ${courseId}`);
  return deleted;
};

const reIngestCourse = async () => {
  const courseName = process.argv[2];

  if (!courseName) {
    console.error("❌ Usage: npx ts-node src/scripts/reIngestCourse.ts \"<CourseName>\"");
    process.exit(1);
  }

  console.log(`\n🔄 Re-ingesting embeddings for course: "${courseName}"\n`);

  // 1. Resolve course ID
  const courseId = await getCourseId(courseName);
  if (!courseId) {
    console.error(`❌ Course "${courseName}" not found in the database.`);
    process.exit(1);
  }
  console.log(`✅ Found course ID: ${courseId}`);

  // 2. Wipe old embeddings
  await deleteEmbeddingsForCourse(courseId);

  // 3. List all blobs for this course
  const courseBlobs = containerClient.listBlobsFlat({ prefix: `${courseName}/` });
  const files: string[] = [];
  for await (const blob of courseBlobs) {
    files.push(blob.name);
  }

  if (files.length === 0) {
    console.error(`❌ No blobs found for prefix "${courseName}/" in Azure container "slides".`);
    process.exit(1);
  }

  console.log(`\n📂 Found ${files.length} file(s) to process:`);
  files.forEach((f) => console.log(`   - ${f}`));
  console.log();

  let totalChunks = 0;
  let totalFailed = 0;

  // 4. Load, chunk, embed, and insert
  for (const file of files) {
    console.log(`\n📄 Processing: ${file}`);

    try {
      const loader = await documentLoader(courseName, file);
      const chunks = await loader.load();

      console.log(`   ↳ Chunked into ${chunks.length} pieces`);

      if (chunks.length === 0) {
        console.warn(`   ⚠️  No chunks produced — skipping.`);
        continue;
      }

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
          const embedding = await Embedder(chunk.pageContent, "document");
          const weekNumber = getWeekNumber(file);

          await insertKnowledgeChunk({
            content: chunk.pageContent,
            embedding,
            course_id: courseId,
            source_filename: chunk.metadata.filename as string,
            week_number: weekNumber,
          });

          totalChunks++;
          process.stdout.write(`\r   ↳ Inserted ${i + 1}/${chunks.length} chunks...`);
        } catch (chunkError) {
          console.error(`\n   ❌ Failed to insert chunk ${i + 1}:`, chunkError);
          totalFailed++;
        }
      }

      console.log(`\n   ✅ Done: ${file}`);
    } catch (fileError) {
      console.error(`\n   ❌ Failed to process file "${file}":`, fileError);
      totalFailed++;
    }
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`✅ Re-ingestion complete for "${courseName}"`);
  console.log(`   Total chunks inserted : ${totalChunks}`);
  console.log(`   Total failures        : ${totalFailed}`);
  console.log(`${"─".repeat(60)}\n`);

  await sequelize.close();
};

reIngestCourse().catch((err) => {
  console.error("❌ Fatal error during re-ingestion:", err);
  process.exit(1);
});
