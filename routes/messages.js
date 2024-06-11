import express from 'express';
import { getAllMessages, sendMessage } from '../controllers/messages.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/* READ */
router.get('/:chatId', verifyToken, getAllMessages);

/* CREATE */
router.post('/', verifyToken, sendMessage);

export default router;