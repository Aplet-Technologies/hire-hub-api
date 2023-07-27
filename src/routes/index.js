import express from "express";
const router = express.Router();
import authRouter from "./auth.router.js";

router.use("/auth", authRouter);

export default router;
