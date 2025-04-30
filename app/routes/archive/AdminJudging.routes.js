import express from "express";

import { attachJudgeToUser, createJudge, createJudgingCriteria, getAllJudges, getAllProjectScores, getJudge, getJudgingCriteria } from "../../controllers/Admin/AdminJudging.controller.js";

const router = express.Router();

// all routes are pre authenticated with Admin.routes.js

/**
 * @openapi
 * 
 * /admin/judging/criteria:
 *  post:
 *      summary: Create judging criteria
 *      description: Create judging criteria for the current year. criteriaList should be a JSON object with weights adding up to 10
 *      tags: [Admin-Judging]
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
 *                        year:
 *                         type: integer
 *                         description: Year for which to create the judging criteria (usually current year).
 *                         default: (current year)
 *                        criteriaList:
 *                          type: object
 *                          description: An object where each key is the name of the criterion and the value is an object with 'description' and 'weight'.  Weights can be floats 0-10 but must all add up to 10
 *                          example: {
 *                            "innovation": {
 *                              "description": "How innovative is the project?",
 *                              "weight": 8.2
 *                            },
 *                            "impact": {
 *                              "description": "Potential impact of the project",
 *                              "weight": 1.8
 *                            }
 *                          }
 * 
 *
 *      responses:
 *          200:
 *              description: Judging criteria created successfully. Returns the created judging criteria object.
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: "#/components/schemas/JudgingCriteria"
 */
router.post("/criteria", createJudgingCriteria);

/**
 * @openapi
 * 
 * /admin/judging/criteria:
 *  get:
 *      summary: Get current year's judging criteria
 *      description: Gets judging criteria which judges can score on
 *      tags: [Admin-Judging]
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
router.get("/criteria", getJudgingCriteria);

/**
 * @openapi
 * 
 * /admin/judging/createjudge:
 *  post:
 *      summary: Create a judge object
 *      description: Create a judge object. Separated from users to allow for easier management of judges. This will create a judge object in the database but will not attach it to any user. Use `/admin/judging/attachjudge` or `/judging/attachjudge` for that.
 *      tags: [Admin-Judging]
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
 *                        year:
 *                          type: integer
 *                          description: Year for which to create the judge (usually current year). 
 *                          default: (current year)
 *
 *      responses:
 *          201:
 *              description: Judge created successfully. Returns the created judge object with truncated user information.
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                             message:
 *                              type: string
 *                              example: "Judge attached to user successfully"
 *                             judge:
 *                              type: object
 *                              $ref: "#/components/schemas/Judge"
 */
router.post("/createjudge", createJudge);

/**
 * @openapi
 * 
 * /admin/judging/attachjudge:
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
 *                        userId:
 *                           type: string
 *                           description: userId of user to attach judge to
 *                        access_code:
 *                           type: string
 *                           description: Access code given on judge creation
 * 
 *
 *      responses:
 *          200:
 *              description: Project score submitted successfully. Returns judge with truncated user object
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                             message:
 *                              type: string
 *                              example: "Judge attached to user successfully"
 *                             judge:
 *                              type: object
 *                              $ref: "#/components/schemas/Judge"
 */
router.post("/attachjudge", attachJudgeToUser);

/**
 * @openapi
 * 
 * /admin/judging/scores/{projectId}:
 *  get:
 *      summary: Get project's scores
 *      description: Gets scores for a specific project. Member's field will be truncated
 *      tags: [Admin-Judging]
 *      parameters:
 *          - in: cookie
 *            name: access_token
 *            description: Login token
 *            required: true
 *            schema:
 *              type: string
 *          - in: path
 *            name: projectId
 *            description: The ID of the project for which to retrieve scores
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
router.get("/scores/:projectId", getAllProjectScores);

/**
 * @openapi
 * 
 * /admin/judging/judges:
 *  get:
 *      summary: Get current year's judges
 *      description: Gets current year's judges. Returns truncated user objects within main object
 *      tags: [Admin-Judging]
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
router.get("/judges", getAllJudges);

/**
 * @openapi
 * 
 * /admin/judging/{judgeId}:
 *  get:
 *      summary: Get judge
 *      description: Get individual judge. Attaches their user and scores with limited data. Data might differ from the example below
 *      tags: [Admin-Judging]
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
router.get("/judges/:id", getJudge);




export default router;

