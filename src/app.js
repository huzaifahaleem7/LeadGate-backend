import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  })
);

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser());


//user Router
import userRouter from './routes/user.route.js'
app.use("/api/v1/user", userRouter)

export default app;
