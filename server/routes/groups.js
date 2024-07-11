import express from 'express'
// import { login } from '../controllers/auth.js'
import { verifyToken } from '../middleware/auth.js';
import { joinGroup, sendMessage, getMessages } from '../controllers/groups.js';
// import { sendMessage } from '../controllers/groupChats.js';

const router = express.Router();

// READ
// router.get(":groupId/members", login);
router.get("/:groupId", verifyToken, getMessages);

// UPDATE
router.post("/:groupId/:secretPasscode/join/:userId", verifyToken, joinGroup)
router.post("/:groupId/:userId/:message", verifyToken, sendMessage)
// router.post(":")

export default router;