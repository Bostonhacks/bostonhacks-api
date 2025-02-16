import { createApplication, getApplication } from "../controllers/Application.controller.js"; 
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { validateApplication } from "../middleware/validateSchema.js";

const router = express.Router();

router.post("/", verifyToken, validateApplication, createApplication);

router.get("/:id", verifyToken, getApplication);


export default router;