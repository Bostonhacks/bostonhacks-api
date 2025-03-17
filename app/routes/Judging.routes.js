import express from "express"
import { submitScore, getProjectScore, getProjectsToJudge, getJudgingCriteria, getAllProjectScores, createJudge, attachJudgeToUser } from "../controllers/Judging.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * @openapi
 * 
 * /judging/criteria:
 *  get:
 *      summary: Get current year's judging criteria
 *      description: Gets judging criteria which judges can score on
 *      tags: [Judging]
 *      parameters:
 *          - in: cookie
 *            name: access_token
 *            description: Login token
 *            required: true
 *            schema:
 *              type: string
 *          - in: query
 *            name: year
 *            description: Year for which to get judging criteria
 *            schema:
 *              type: integer
 *
 *      responses:
 *          200:
 *              description: User info retrieved successfully. Includes truncated application and projects data.
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: "#/components/schemas/JudgingCriteria"
 */
router.get("/criteria", verifyToken, getJudgingCriteria);

router.get("/projects", verifyToken, getProjectsToJudge);

router.post("/submit", verifyToken, submitScore);

router.post("/createjudge", verifyToken, createJudge);

router.get("/score/:projectId", verifyToken, getProjectScore);

// verify admin too, not just token
router.get("/scores/:projectId", verifyToken, getAllProjectScores);

router.post("/attachjudge", verifyToken, attachJudgeToUser);



export default router;