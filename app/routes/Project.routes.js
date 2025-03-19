import express from "express"
import { verifyToken } from "../middleware/verifyToken.js";
import { createProject, deleteProject, getProject, updateProject } from "../controllers/Project.controller.js";

const router = express.Router();


router.get("/:id", verifyToken, getProject);

router.put("/:id", verifyToken, updateProject);

router.post("/", verifyToken, createProject);

router.delete("/:id", verifyToken, deleteProject);

export default router;