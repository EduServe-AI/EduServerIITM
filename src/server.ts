import config from "./config/constants";
import { sequelize } from "./config/db.config";
import { syncModels } from "./models";
import { populateCoursesIfEmpty } from "./scripts/populateCourses";
import { populateLevelsIfEmpty } from "./scripts/populateLevels";
import { setUpAssociations } from "./models/assosciations";

// Database connection
sequelize
  .authenticate()
  .then(async () => {
    console.log(
      "✅ Connection to the database has been established successfully"
    );
    setUpAssociations();
    await syncModels();
    await populateLevelsIfEmpty();
    await populateCoursesIfEmpty();
  })
  .catch((err) => {
    console.error("❌ DB Connection failed:", err);
  });

import app from "./app";
// App connection with express
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
});
