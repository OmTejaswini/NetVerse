import express from 'express'
import {verifyToken} from "../middleware/auth.js"
import { sendMessage, getMessages } from '../controllers/chats.js';

const router = express.Router();

/* READ */
router.get("/:user1Id/:user2Id", verifyToken, getMessages);
// router.get("/:id/friends", getUserFriends);

router.post("/:user1Id/:user2Id/:message", verifyToken, sendMessage)


export default router;