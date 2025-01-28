import express from "express"
import { getUser, createUser, deleteUser } from "../controllers/User.controller.js";

const router = express.Router();

/**
 * Get user by id or email
 */
router.get("/", getUser);

router.post("/", createUser);

router.delete("/", deleteUser);

export default router;