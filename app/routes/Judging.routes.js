import express from "express"
import { submitScore, getScore, getProjectsToJudge, getJudgingCriteria, getAllProjectScores, attachJudgeToUser, updateScore, getAllJudges, getJudgesScores, getJudge } from "../controllers/Judging.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/admin.js";

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

/**
 * @openapi
 * 
 * /judging/projects:
 *  get:
 *      summary: Get projects to judge
 *      description: Gets projects that are available for judging
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
 *            description: Year for which to get projects (optional)
 *            schema:
 *              type: integer
 *              default: CurrentYear
 *
 *      responses:
 *          200:
 *              description: Projects retrieved successfully
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: "#/components/schemas/Project"
 */
router.get("/projects", verifyToken, getProjectsToJudge);

/**
 * @openapi
 * 
 * /judging/score:
 *  post:
 *      summary: Submit a score for a project
 *      description: Submit a score for a project. User must be attached to a judge object.
 *      tags: [Judging]
 *      parameters:
 *          - in: cookie
 *            name: access_token
 *            description: Login token
 *            required: true
 *            schema:
 *              type: string
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                     type: object
 *                     properties:
 *                        projectId:
 *                           type: string
 *                           description: ID of the project
 *                           example: "12345"
 *                        scoreData:
 *                           type: object
 *                           description: Score data for the project with the fields specified in that year's judging criteria
 *                           example: {"criteria1": 8, "criteria2": 9}
 * 
 *
 *      responses:
 *          201:
 *              description: Project score submitted successfully
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                             message:
 *                              type: string
 *                              example: "Score submitted successfully"
 *                             score:
 *                              type: object
 *                              $ref: "#/components/schemas/Score"
 *                             totalScore:
 *                              type: number
 *                              description: Calculated score from score data
 *                              example: 17
 */
router.post("/score", verifyToken, submitScore);

/**
 * @openapi
 * 
 * /judging/scores:
 *  get:
 *      summary: Get judge's scores
 *      description: Gets a judge's scores for projects. User must be the judge to access
 *      tags: [Judging]
 *      parameters:
 *          - in: cookie
 *            name: access_token
 *            description: Login token
 *            required: true
 *            schema:
 *              type: string
 *          - in: query
 *            name: judgeId
 *            description: Judge ID to get scores for
 *            required: true
 *            schema:
 *              type: string
 *
 *      responses:
 *          200:
 *              description: Scores retrieved successfully
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                             type: object
 *                             $ref: "#/components/schemas/Score"
 */
router.get("/scores", verifyToken, getJudgesScores);

/**
 * @openapi
 * 
 * /judging/score/{scoreId}:
 *  get:
 *      summary: Get a score 
 *      description: Get a specific score. User must be attached to a judge object.
 *      tags: [Judging]
 *      parameters:
 *          - in: cookie
 *            name: access_token
 *            description: Login token
 *            required: true
 *            schema:
 *              type: string
 *
 *      responses:
 *          200:
 *              description: Score retrieved successfully
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: "#/components/schemas/Score"
 */
router.get("/score/:scoreId", verifyToken, getScore);

/**
 * @openapi
 * 
 * /judging/score/{scoreId}:
 *  put:
 *      summary: Update a score for a project
 *      description: Update a score for a project. User must be attached to a judge object.
 *      tags: [Judging]
 *      parameters:
 *          - in: cookie
 *            name: access_token
 *            description: Login token
 *            required: true
 *            schema:
 *              type: string
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                     type: object
 *                     properties:
 *                        scoreData:
 *                           type: object
 *                           description: Score data for the project with the fields specified in that year's judging criteria
 *                           example: {"criteria1": 8, "criteria2": 9}
 * 
 *
 *      responses:
 *          200:
 *              description: Project score updated successfully
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                             message:
 *                              type: string
 *                              example: "Score submitted successfully"
 *                             updatedScore:
 *                              type: object
 *                              $ref: "#/components/schemas/Score"
 */
router.put("/score/:scoreId", verifyToken, updateScore);



/**
 * @openapi
 * 
 * /judging/judges:
 *  get:
 *      summary: Get current year's judges
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
 *            description: Year for which to get judges
 *            schema:
 *              type: integer
 *
 *      responses:
 *          200:
 *              description: Judges retrieved successfully
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                             type: object
 *                             $ref: "#/components/schemas/Judge"
 */
router.get("/judges", verifyToken, getAllJudges);

/**
 * @openapi
 * 
 * /judging/{judgeId}:
 *  get:
 *      summary: Get judge
 *      description: Get individual judge. Attaches their user and scores with limited data. Data might differ from the example below
 *      tags: [Judging]
 *      parameters:
 *          - in: cookie
 *            name: access_token
 *            description: Login token
 *            required: true
 *            schema:
 *              type: string
 *
 *      responses:
 *          200:
 *              description: Judge retrieved successfully
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: "#/components/schemas/Judge"
 */
router.get("/judges/:id", verifyToken, getJudge);


// verify admin too, not just token. move this to admin functions only
router.get("/scores/:projectId", verifyToken, getAllProjectScores);

router.post("/attachjudge", verifyToken, attachJudgeToUser);






export default router;