import express from "express"
import { getApplication, createApplication, deleteApplication } from "../controllers/Application.controller.js";

const router = express.Router();

/**
 * Get application by id or email
 */
router.get("/", getApplication);

router.post("/", createApplication);

router.delete("/", deleteApplication);

export default router;