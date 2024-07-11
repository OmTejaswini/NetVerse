import express from "express";
import {
  getUser,
  getUserFriends,
  addRemoveFriend,
  getUsers,
  getUserGroups
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/:id", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);
router.get("/:id/groups", verifyToken, getUserGroups);
router.get("/search/:query", getUsers)

/* UPDATE */
router.patch("/:id/:friendId", verifyToken, addRemoveFriend);

export default router;
