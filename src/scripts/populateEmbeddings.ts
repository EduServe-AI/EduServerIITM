import { AzureBlobStorageContainerLoader } from "@langchain/community/document_loaders/web/azure_blob_storage_container";
import { AzureBlobStorageFileLoader } from "@langchain/community/document_loaders/web/azure_blob_storage_file";
import {
  countCourseKnowledgeBaseRows,
  countKnowledgeBaseRows,
  insertKnowledgeChunk,
} from "../services/knowledgeBase.service";
import DocumentIntelligence, {
  isUnexpected,
  getLongRunningPoller,
} from "@azure-rest/ai-document-intelligence";
import { getCourseId, getWeekNumber } from "../services/course.service";
import { documentLoader, Embedder } from "../utils/llm";
import { BlobSASPermissions, BlobServiceClient } from "@azure/storage-blob";

import config from "../config/constants";
import { AzureKeyCredential } from "@azure/core-auth";
import Course from "../models/course.model";

// Azure doc intel client

const client = DocumentIntelligence(
  process.env.AZURE_DOC_INTEL_ENDPOINT!,
  new AzureKeyCredential(process.env.AZURE_DOC_INTEL_KEY!)
);
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!
);
const containerClient = blobServiceClient.getContainerClient("slides");

export const populateCourseEmbeddingsIfEmpty = async () => {
  // const courseId = await getCourseId(courseName);

  const courseName = process.argv[2];
  console.log("Course name ", courseName);

  const courseId = await getCourseId(courseName);

  const rows = await countCourseKnowledgeBaseRows(courseId as string);

  if (rows === 0) {
    console.log(`Course ${courseName} has no embeddings. Populating......`);

    const courseBlobs = containerClient.listBlobsFlat({
      prefix: `${courseName}/`,
    });

    try {
      const files = [];
      for await (const blob of courseBlobs) {
        files.push(blob.name);
      }

      console.log("Retreived course blobs ", files);

      // This gets the loader w.r.t course

      for (const file of files) {
        const loader = await documentLoader(courseName, file);

        const chunks = await loader.load();
        console.log(
          `Loaded and chunked ${chunks.length} documents from ${file}`
        );

        if (chunks.length === 0) {
          console.warn(`No documents found . Skipping.`);
          return;
        }

        for (const chunk of chunks) {
          // const embedding = await embeddings.embedQuery(chunk.pageContent);

          const embeddings = await Embedder(chunk.pageContent, "document");

          const weekNumber = getWeekNumber(file as string);

          await insertKnowledgeChunk({
            content: chunk.pageContent,
            embedding: embeddings,
            course_id: courseId!,
            source_filename: chunk.metadata.filename as string,
            week_number: weekNumber,
          });

          console.log(`✅ succesfully inserted ${chunk.metadata.page_number} `);
        }
      }

      // const chunks = await loader.load();
      // console.log(`Loaded and chunked ${chunks.length} documents from Azure.`);

      // // console.log("docs", chunks);

      console.log(`Knowledge Base populated successfully for ${courseName}}`);
    } catch (error) {
      console.error("❌ Error populating Embeddings", error);
      throw error;
    }
  } else {
    console.log(`Course ${courseName} has embeddings. Skipping......`);
  }
};

export const populateEmbeddingsIfEmpty = async () => {
  const rows = await countKnowledgeBaseRows();

  if (rows === 0) {
    console.log("Knowledge base is empty. Starting population...");
    // Here we need to load the document from azure container

    try {
      // Retreiving all the courses from the database
      const courses = await Course.findAll();
      if (courses.length === 0) {
        console.error("No courses found in DB. Please populate courses first.");
        throw new Error(
          "No courses found in DB. Please populate courses first."
        );
      }

      console.log(
        `Found ${courses.length} courses. Starting sequential embedding...`
      );

      for (const course of courses) {
        // await populateCourseEmbeddingsIfEmpty(course);
        console.log("course", course);
      }

      console.log("✅ All courses embedded successfully.");
    } catch (error) {
      console.error("❌ Error populating Embeddings", error);
      throw error;
    }
  } else {
    console.log(
      `ℹ️ KnowledgeBase has already ${rows} record skipping population`
    );
    return rows;
  }
};

if (require.main === module) {
  populateCourseEmbeddingsIfEmpty().catch(console.error);
}
