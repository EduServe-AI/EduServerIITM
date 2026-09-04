import sequelize from "../config/db.config";
import { syncModels } from "../models";
import { setUpAssociations } from "../models/assosciations";
import { populateBotsIfEmpty } from "../scripts/populateBots";
import { populateCoursesIfEmpty } from "../scripts/populateCourses";
import { populateDaysIfEmpty } from "../scripts/populateDays";
import { populateLanguagesIfEmpty } from "../scripts/populateLanguages";
import { populateLevelsIfEmpty } from "../scripts/populateLevels";
import { populateProjectsIfEmpty } from "../scripts/populateProjects";

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;
let associationsInitialized = false;

export const initializeDatabase = () => {
  if (isInitialized) return Promise.resolve();

  // If initialization is already in progress, return the existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      await sequelize.authenticate();
      console.log(
        "✅ Connection to the database has been established successfully",
      );

      if (!associationsInitialized) {
        setUpAssociations();
        associationsInitialized = true;
      }

      // In production, we might want to be careful with sync({ alter: true })
      // But for now we keep the existing logic
      await syncModels();

      await populateLevelsIfEmpty();
      await populateCoursesIfEmpty();
      await populateLanguagesIfEmpty();
      await populateDaysIfEmpty();
      await populateBotsIfEmpty();
      await populateProjectsIfEmpty();

      // Note: user's server.ts had commented out populateEmbeddingsIfEmpty
      // and server.ts didn't explicitly call initializeKnowledgeBase but models/index.ts syncModels call did.
      // We should rely on what syncModels does or what server.ts did.
      // server.ts called syncModels(), which calls User.sync, ..., and initializeKnowledgeBase() at the end.
      // So we don't need to call initializeKnowledgeBase explicitly here if syncModels does it.

      isInitialized = true;
    } catch (err) {
      console.error("❌ DB Connection failed:", err);
      // Reset promise so we can try again on next request if it failed
      initializationPromise = null;
      throw err;
    }
  })();

  return initializationPromise;
};
