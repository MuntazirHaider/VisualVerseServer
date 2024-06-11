import express from 'express';
import {
    deleteNotifications,
    fetchAllNotifications,
    updateNotifications
} from '../controllers/notifications.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/* READ */
router.get('/', verifyToken, fetchAllNotifications);

/* CREATE */
router.post('/', verifyToken, updateNotifications);

/* DELETE */
router.delete('/', verifyToken, deleteNotifications);

export default router;