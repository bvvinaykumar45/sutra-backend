import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import healthCheckRouter from "./routes/health-check.route.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import { ApiError } from "./utils/api-error.js";

const app = express();

// Basic configurations
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);

// Routes
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);

app.get("/", (req, res) => {
  res.send("Welcome to Sutra Backend");
});

app.use((err, req, res, next) => {
  console.error({
    error: err.message,
    errors: err.errors,
    stack: err.stack,
  });

  if (err.statusCode < 500)
    return res
      .status(err.statusCode)
      .json(
        new ApiError(
          err.statusCode,
          err.message,
          err.errors?.length !== 0 ? err.errors : [],
          err.stack,
        ),
      );
  return res.status(500).json({ message: "Something went wrong" });
});

export default app;
