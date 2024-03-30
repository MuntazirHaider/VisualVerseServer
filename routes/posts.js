import express from "express";
import {
    createComment,
    getFeedPosts, 
    getUserPosts,
    likePost,
    deleteComment,
    deletePost
} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* Create */
router.post("/:id/comment", verifyToken, createComment)

/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);

/* UPDATE */
router.put("/:id/like", verifyToken, likePost);

/* DELETE */
router.delete("/:id/delete", verifyToken, deletePost);
router.delete("/:id/comment/delete", verifyToken, deleteComment);

export default router;