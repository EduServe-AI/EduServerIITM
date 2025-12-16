import app from "./app";
import config from "./config/constants";
import sequelize from "./config/db.config";
import { syncModels } from "./models";
import { setUpAssociations } from "./models/assosciations";
import { populateBotsIfEmpty } from "./scripts/populateBots";
import { populateCoursesIfEmpty } from "./scripts/populateCourses";
import { populateDaysIfEmpty } from "./scripts/populateDays";
import { populateLanguagesIfEmpty } from "./scripts/populateLanguages";
import { populateLevelsIfEmpty } from "./scripts/populateLevels";

// Initialize database (non-blocking for serverless)
let isInitialized = false;

async function initializeDatabase() {
  if (isInitialized) return;

  try {
    await sequelize.authenticate();
    console.log(
      "✅ Connection to the database has been established successfully"
    );
    setUpAssociations();
    await syncModels(); // Everyone should practice migrations
    await populateLevelsIfEmpty();
    await populateCoursesIfEmpty();
    await populateLanguagesIfEmpty();
    await populateDaysIfEmpty();
    await populateBotsIfEmpty();
    // await populateEmbeddingsIfEmpty();
    isInitialized = true;
  } catch (err) {
    console.error("❌ DB Connection failed:", err);
    throw err;
  }
}

// For local development
if (process.env.NODE_ENV !== "production") {
  initializeDatabase().then(() => {
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
    });
  });
} else {
  // For serverless, initialize on first request (fire and forget)
  initializeDatabase().catch(console.error);
}

// Export for Vercel serverless
export default app;
