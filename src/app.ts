import express, { Request, Response } from "express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import levelRoutes from "./routes/level.routes";
import instructorRoutes from "./routes/instructor.routes";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import enrollmentRoutes from "./routes/enrollment.routes";
import courseRoutes from "./routes/course.routes";

const app = express();

// Handling Cors
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Regsitering the routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/level", levelRoutes);
app.use("/api/v1/enrollment", enrollmentRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/instructor", instructorRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Eduserve Backend </h1>");
});

export default app;
