import express from "express";
import { translateMessage } from "../controllers/translateController.js"; // ✅ Named import

const router = express.Router();

router.post("/", translateMessage);

export default router;
