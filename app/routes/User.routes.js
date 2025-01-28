import express from "express"
import { getUser } from "../controllers/User.controller.js";

const router = express.Router();

/**
 * Get user by id or email
 */
router.get("/", getUser);

export default router;