import express from "express"
import { getUser } from "../controllers/User.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * Get user by id or email
 */
router.get("/", verifyToken, getUser);

export default router;