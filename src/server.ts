import app from "./app";
import config from "./config/constants";
import { sequelize } from "./config/db.config";
import { syncModels } from "./models";
import { populateLevelsIfEmpty } from "./scripts/populateLevels";

// Database connection
sequelize
  .authenticate()
  .then(async () => {
    console.log(
      "✅ Connection to the database has been established successfully"
    );
    await syncModels();
    await populateLevelsIfEmpty();
  })
  .catch((err) => {
    console.error("❌ DB Connection failed:", err);
  });

// App connection with express
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
});
