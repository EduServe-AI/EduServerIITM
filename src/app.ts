import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import morgan from "morgan";
import passport from "./config/passport.config";
import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.route";
import chatBotRoutes from "./routes/chatbot.routes";
import courseRoutes from "./routes/course.routes";
import enrollmentRoutes from "./routes/enrollment.routes";
import instructorRoutes from "./routes/instructor.routes";
import levelRoutes from "./routes/level.routes";
import studentRoutes from "./routes/student.routes";
import userRoutes from "./routes/user.routes";

const app = express();

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
      if (origin.match(/https:\/\/.*\.ngrok-free\.app$/)) {
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
    ],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400, // 24 hours
  })
);

// Handle preflight requests explicitly
app.options("*path", cors());

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
app.use("/api/v1/instructor", instructorRoutes);
app.use("/api/v1/bot", chatBotRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/chat", chatRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Eduserve Backend </h1>");
});

export default app;
