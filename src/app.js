import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

// Import your middleware and routes
import errorMiddleware from "./middlewares/error.middleware.js";
import userRouter from "./routes/user.route.js";
import leadRouter from "./routes/lead.route.js";

const app = express();

// -------------------------
// Middlewares
// -------------------------
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // e.g., http://localhost:5173
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// -------------------------
// API Routes
// -------------------------
app.use("/api/v1/user", userRouter);
app.use("/api/v1/lead", leadRouter);

// Error handling middleware (moved after API routes)
app.use(errorMiddleware);

// -------------------------
// // Serve React static files & handle refresh
// // Must be AFTER API routes
// // -------------------------
// const buildPath = path.join(process.cwd(), "build"); // points to project root + build
// app.use(express.static(buildPath));

// // Catch-all route for React Router
// app.get("*", (req, res) => {
//   res.sendFile(path.join(buildPath, "index.html"));
// });

// -------------------------
export default app;