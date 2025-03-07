import express from "express"
import { submitScore, getProjectScore, getProjectsToJudge, getJudgingCriteria, getAllProjectScores, createJudge } from "../controllers/Judging.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/criteria", verifyToken, getJudgingCriteria);

router.get("/projects", verifyToken, getProjectsToJudge);

router.post("/submit", verifyToken, submitScore);

router.post("/createjudge", verifyToken, createJudge);

router.get("/score/:projectId", verifyToken, getProjectScore);

// verify admin too, not just token
router.get("/scores/:projectId", verifyToken, getAllProjectScores);



export default router;