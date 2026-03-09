/**
 * ============================================================
 * 🧮 PDSA File Search Store Setup Script
 * ============================================================
 *
 * This script creates a Gemini File Search Store for the
 * "Mathematics for Data Science I" (Maths-I) course.
 *
 * What it does:
 *   1. Creates a new File Search Store named "PDSA Store"
 *   2. Outputs the store name/ID for you to use
 *   3. Optionally uploads files to the store if file paths are provided
 *
 * Usage:
 *   # Just create the store (no files uploaded):
 *   npx ts-node src/scripts/setupMaths1FileSearchStore.ts
 *
 *   # Create the store AND upload files:
 *   npx ts-node src/scripts/setupMaths1FileSearchStore.ts ./path/to/file1.pdf ./path/to/file2.pdf
 *
 * After running, copy the store name (e.g., fileSearchStores/xyz123)
 * and use it as a tool in your LLM configuration.
 *
 * ============================================================
 */

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set in environment variables.");
  process.exit(1);
}

// Initialize the Google GenAI client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ── Configuration ──────────────────────────────────────────
const STORE_DISPLAY_NAME = "PDSA Store";

// ── Helper: Poll until upload operation completes ──────────
async function waitForUploadOperation(
  operation: any,
  maxRetries: number = 30,
  intervalMs: number = 5000
): Promise<void> {
  console.log(`   ⏳ Waiting for upload operation to complete: ${operation.name}`);

  let currentOp = operation;

  for (let i = 0; i < maxRetries; i++) {
    if (currentOp.done) {
      if (currentOp.error) {
        throw new Error(
          `Upload operation failed: ${JSON.stringify(currentOp.error)}`
        );
      }
      console.log(`   ✅ Upload operation completed successfully.`);
      return;
    }

    console.log(
      `   ⏳ Still processing... (attempt ${i + 1}/${maxRetries})`
    );
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    try {
      currentOp = await ai.operations.get({ operation: currentOp });
    } catch (error: any) {
      console.log(`   ⚠️  Could not fetch operation status, retrying...`);
    }
  }

  console.warn(
    `   ⚠️  Operation may still be processing. Check AI Studio for status.`
  );
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║   🧮 PDSA File Search Store Setup            ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // ── Step 1: Check if a PDSA store already exists ──────
  console.log("📋 Step 1: Checking for existing File Search Stores...\n");

  let existingStore: any = null;

  try {
    const stores = await ai.fileSearchStores.list({
      config: { pageSize: 100 },
    });

    for await (const store of stores) {
      if (store.displayName === STORE_DISPLAY_NAME) {
        existingStore = store;
        break;
      }
    }
  } catch (error: any) {
    console.log("   ℹ️  Could not list existing stores. Proceeding to create new one.\n");
  }

  let storeName: string;

  if (existingStore) {
    console.log(`   ✅ Found existing store: ${existingStore.name}`);
    console.log(`      Display Name: ${existingStore.displayName}`);
    console.log(`      Active Docs: ${existingStore.activeDocumentsCount || 0}`);
    console.log(`      Pending Docs: ${existingStore.pendingDocumentsCount || 0}`);
    console.log(`      Failed Docs: ${existingStore.failedDocumentsCount || 0}\n`);
    storeName = existingStore.name!;
  } else {
    // ── Step 2: Create the File Search Store ─────────────────
    console.log("🏗️  Step 2: Creating a new File Search Store...\n");

    try {
      const store = await ai.fileSearchStores.create({
        config: {
          displayName: STORE_DISPLAY_NAME,
        },
      });

      storeName = store.name!;

      console.log(`   ✅ File Search Store created successfully!`);
      console.log(`   📌 Store Name: ${storeName}`);
      console.log(`   📌 Display Name: ${store.displayName}`);
      console.log(`   📌 Created At: ${store.createTime}\n`);
    } catch (error: any) {
      console.error("❌ Failed to create File Search Store:");
      console.error(error.message || error);
      process.exit(1);
    }
  }

  // ── Step 3: Upload files if provided via CLI args ──────────
  const filePaths = process.argv.slice(2);

  if (filePaths.length > 0) {
    console.log(`📤 Step 3: Uploading ${filePaths.length} file(s) to the store...\n`);

    for (const filePath of filePaths) {
      const absolutePath = path.resolve(filePath);

      // Validate file exists
      if (!fs.existsSync(absolutePath)) {
        console.error(`   ❌ File not found: ${absolutePath}`);
        continue;
      }

      const fileName = path.basename(absolutePath);
      console.log(`   📄 Uploading: ${fileName}`);

      try {
        const operation = await ai.fileSearchStores.uploadToFileSearchStore({
          fileSearchStoreName: storeName,
          file: absolutePath,
          config: {
            displayName: fileName,
          },
        });

        console.log(`   📌 Operation started: ${operation.name}`);

        // Wait for the operation to complete
        if (!operation.done) {
          await waitForUploadOperation(operation);
        } else {
          console.log(`   ✅ Upload completed immediately.`);
        }

        if (operation.response?.documentName) {
          console.log(
            `   📌 Document Name: ${operation.response.documentName}`
          );
        }

        console.log("");
      } catch (error: any) {
        console.error(`   ❌ Failed to upload ${fileName}:`);
        console.error(`      ${error.message || error}\n`);
      }
    }
  } else {
    console.log("📤 Step 3: No files specified. Skipping upload.\n");
    console.log("   💡 To upload files, run the script with file paths:");
    console.log(
      "      npx ts-node src/scripts/setupMaths1FileSearchStore.ts ./path/to/file.pdf\n"
    );
  }

  // ── Step 4: Print summary ──────────────────────────────────
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║   📋 Summary                                    ║");
  console.log("╠══════════════════════════════════════════════════╣");
  console.log(`║                                                  ║`);
  console.log(`║   Store Name: ${storeName.padEnd(35)}║`);
  console.log(`║                                                  ║`);
  console.log("╚══════════════════════════════════════════════════╝\n");

  // Extract just the store ID from the full name
  const storeId = storeName.replace("fileSearchStores/", "");

  console.log("🔧 HOW TO USE THIS STORE WITH YOUR LLM:\n");
  console.log("   Use the following as a tool configuration in your Gemini API call:\n");
  console.log("   ┌─────────────────────────────────────────────────────────────┐");
  console.log(`   │  tools: [{                                                  │`);
  console.log(`   │    fileSearch: {                                             │`);
  console.log(`   │      fileSearchStoreNames: ["${storeName}"]  │`);
  console.log(`   │    }                                                        │`);
  console.log(`   │  }]                                                         │`);
  console.log("   └─────────────────────────────────────────────────────────────┘\n");

  console.log("   Store ID (for reference):", storeId);
  console.log("   Full Store Name:", storeName);
  console.log("");
  console.log("   📌 You can upload more files to this store anytime by running:");
  console.log(
    `      npx ts-node src/scripts/setupMaths1FileSearchStore.ts ./file1.pdf ./file2.pdf\n`
  );

  // ── Fetch final store status ───────────────────────────────
  try {
    const finalStore = await ai.fileSearchStores.get({ name: storeName });
    console.log("   📊 Current Store Status:");
    console.log(
      `      - Active Documents:  ${finalStore.activeDocumentsCount || 0}`
    );
    console.log(
      `      - Pending Documents: ${finalStore.pendingDocumentsCount || 0}`
    );
    console.log(
      `      - Failed Documents:  ${finalStore.failedDocumentsCount || 0}`
    );
    console.log(`      - Total Size:        ${finalStore.sizeBytes || 0} bytes`);
  } catch (err) {
    // non-critical, skip
  }

  console.log("\n✅ Done! Store is ready for use.\n");
}

main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
