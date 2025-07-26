import express , { Request , Response } from "express"
import authRoutes from "./routes/auth.routes"
import cors from "cors"
import morgan from "morgan"


const app = express();


// Handling Cors
app.use(
  cors({
    origin: [
      'http://localhost:3000',
    ],
    credentials: true,
  })
)


app.use(express.json());
app.use(morgan("dev"));

// Regsitering the routes
app.use("/api/v1/auth" , authRoutes)


app.get('/' , (req : Request , res : Response) => {
    res.send("<h1>Eduserve Backend </h1>"); 
})

export default app; 