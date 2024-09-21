import express from 'express';
import {
    getUser,
    getUserFriends,
    addRemoveFriends,
    updateProfile,
    deleteUser,
    searchUser,
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    RemoveFriend
} from '../controllers/users.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/* READ */
router.get("/:id", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);
router.get("/friendRequests/:recipientId", verifyToken, getFriendRequests);

/* CREATE */
router.post("/sendRequest/:recipientId", verifyToken, sendFriendRequest)

/* SEARCH */
router.get("/", verifyToken, searchUser);

/* UPDATE */
// router.put("/:id/:friendId", verifyToken, addRemoveFriends);
router.put("/update", verifyToken, updateProfile);
router.put("/acceptRequest", verifyToken, acceptFriendRequest)

/* DELETE */
router.delete("/:id/delete", verifyToken, deleteUser);
router.delete("/rejectRequest", verifyToken, rejectFriendRequest);
router.delete("/:id/:friendId", verifyToken, RemoveFriend);

export default router;