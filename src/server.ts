import config from "./config/constants";
import sequelize from "./config/db.config";

import { setUpAssociations } from "./models/assosciations";
import { populateCoursesIfEmpty } from "./scripts/populateCourses";
import { populateLevelsIfEmpty } from "./scripts/populateLevels";

// Database connection
sequelize
  .authenticate()
  .then(async () => {
    console.log(
      "✅ Connection to the database has been established successfully"
    );
    setUpAssociations();
    // await syncModels(); // Everyone should practice migrations
    await populateLevelsIfEmpty();
    await populateCoursesIfEmpty();
    await populateLanguagesIfEmpty();
    await populateDaysIfEmpty();
    await populateBotsIfEmpty();
    // await populateEmbeddingsIfEmpty();
  })
  .catch((err) => {
    console.error("❌ DB Connection failed:", err);
  });

import app from "./app";
import { populateBotsIfEmpty } from "./scripts/populateBots";
import { populateDaysIfEmpty } from "./scripts/populateDays";
import { populateLanguagesIfEmpty } from "./scripts/populateLanguages";
// App connection with express
app.listen(config.port, () => {
  console.log(`🚀 Server running on the port${config.port}`);
}); 
