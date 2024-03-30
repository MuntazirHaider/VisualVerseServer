import express from 'express';
import {
    getUser,
    getUserFriends,
    addRemoveFriends,
    updateProfile,
    deleteUser
} from '../controllers/users.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/* READ */
router.get("/:id", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);

/* UPDATE */
router.put("/:id/:friendId", verifyToken, addRemoveFriends);
router.put("/update", verifyToken, updateProfile);

/* DELETE */
router.delete("/:id/delete", verifyToken, deleteUser);

export default router;