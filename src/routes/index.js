import express from "express";
const router = express.Router();
import authRouter from "./auth.router.js";

router.use("/api", authRouter);
export default router;
