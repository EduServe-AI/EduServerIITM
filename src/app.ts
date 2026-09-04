import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import passport from "./config/passport.config";
import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.route";
import chatBotRoutes from "./routes/chatbot.routes";
import courseRoutes from "./routes/course.routes";
import documentLinkRoutes from "./routes/documentLink.routes";
import enrollmentRoutes from "./routes/enrollment.routes";
import instructorRoutes from "./routes/instructor.routes";
import levelRoutes from "./routes/level.routes";
import sessionRoutes from "./routes/session.routes";
import studentRoutes from "./routes/student.routes";
import userRoutes from "./routes/user.routes";
import projectRoutes from "./routes/project.routes";
import { initializeDatabase } from "./utils/bootstrap";

const app = express();

// Start DB initialization eagerly at module load.
// The middleware below will block requests until it completes.
const initPromise = initializeDatabase();

// Handling Cors
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) return callback(null, true);

      // Allow localhost for development
      if (
        origin.startsWith("http://localhost:3000") ||
        origin.startsWith("http://localhost:3001")
      ) {
        return callback(null, true);
      }

      // Allow production and all Vercel preview deployments
      if (origin.match(/https:\/\/edu-client-iitm.*\.vercel\.app$/)) {
        return callback(null, true);
      }

      // Allow ngrok URLs for testing
      if (origin.match(/https:\/\/.*\.ngrok-free\.(app|dev)$/)) {
        return callback(null, true);
      }

      // Reject all other origins
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Cookie",
      "Set-Cookie",
      "ngrok-skip-browser-warning",
    ],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400, // 24 hours
  })
);

// Block requests until DB initialization is complete (near-zero overhead after first resolve)
app.use((req: Request, res: Response, next: NextFunction) => {
  initPromise.then(() => next()).catch(next);
});

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(morgan("dev"));

// Regsitering the routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/level", levelRoutes);
app.use("/api/v1/enrollment", enrollmentRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1/instructor", instructorRoutes);
app.use("/api/v1/bot", chatBotRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/session", sessionRoutes);
app.use("/api/v1/document-links", documentLinkRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Eduserve Backend </h1>");
});

export default app;
