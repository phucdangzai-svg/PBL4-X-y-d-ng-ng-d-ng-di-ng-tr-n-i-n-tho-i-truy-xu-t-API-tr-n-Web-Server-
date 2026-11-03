import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import rootRouter from "./routes/index.js";
import cors from "cors";
import path from "path";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";
import { connectionDb } from "./configs/db.config.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(morgan("combined"));

app.get("/", (req, res) => {
  res.json({
    message: "🚀 API Server is running!",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1", rootRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectionDb();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
