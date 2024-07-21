import express from "express";
import {
    createFeedback
} from "../controllers/feedback.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* Create */
router.post("/", verifyToken, createFeedback);   // create a new feedback

export default router;