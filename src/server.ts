import app from "./app";
import config from "./config/constants";
import { initializeDatabase } from "./utils/bootstrap";

// For local development
if (process.env.NODE_ENV !== "production") {
  initializeDatabase().then(() => {
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
    });
  });
} else {
  // For serverless production, fire-and-forget initialization on first invocation
  initializeDatabase().catch(console.error);
} 

// Export for Vercel serverless
export default app;

