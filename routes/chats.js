import express from "express";
import {
    accessChat,
    createGroup, 
    fetchChats,
    renameGroup,
    addToGroup,
    removeFromGroup,
    searchChatUser,
    updateGroup
} from "../controllers/chats.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* Create */
router.post("/", verifyToken, accessChat);   // access the chat section
router.post("/groupChat", verifyToken, createGroup);   // Create the chat group section

/* READ */
router.get("/", verifyToken, fetchChats);   // Fetch the chat section

/* SEARCH */
router.get("/search", verifyToken, searchChatUser);   // search user for the chat

/* UPDATE */
router.put("/groupChat/update", verifyToken, updateGroup);   // Update the chat group section
router.put("/groupChat/rename", verifyToken, renameGroup);   // Rename the chat group section
router.put("/groupChat/add", verifyToken, addToGroup);   // add to chat group section

/* DELETE */
router.put("/groupChat/remove", verifyToken, removeFromGroup);   // remove from chat group section

export default router;