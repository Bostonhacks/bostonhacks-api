import express from "express"
import { getUser, createUser } from "../controllers/User.controller.js";

const router = express.Router();

/**
 * Get user by id or email
 */
router.get("/", getUser);

router.post("/", createUser);

export default router;