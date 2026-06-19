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
  const statusCode = err.statusCode || 500;
  const errors =
    Array.isArray(err.errors) && err.errors.length > 0 ? err.errors : [];

  console.error({
    error: err.message,
    errors,
    stack: err.stack,
  });

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: statusCode < 500 ? err.message : "Something went wrong",
    errors,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
