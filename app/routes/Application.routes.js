import { createApplication, getApplication, getUserApplications } from "../controllers/Application.controller.js"; 
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { validateApplication } from "../middleware/validateSchema.js";

const router = express.Router();

/**
 * @openapi
 * 
 * /application:
 *  post:
 *      summary: Create an application
 *      description: Create an application for a user. 
 *      tags: [Application]
 *      parameters:
 *          - $ref: "#/components/parameters/access_token"
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/Application"
 *      responses:
 *          201:
 *              description: Application successfully created
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message: 
 *                                  type: string            
 *                                  example: Successfully created application
 *                              application: 
 *                                  $ref: "#/components/schemas/Application"
 *          401:
 *              $ref: "#/components/responses/401unauthorized"
 *          400:
 *              description: Missing required fields or missing user id
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  example: Missing required fields 
 *                              fields:
 *                                  type: array
 *                                  items:
 *                                      type: string
 *                                  example: ["name", "url"]
 *                                     
 *          403:
 *              $ref: "#/components/responses/403forbidden"
 *          500:
 *              $ref: "#/components/responses/500internalservererror"
 */
router.post("/", verifyToken, validateApplication, createApplication);


/**
 * @openapi
 * 
 * /application/user:
 *  get:
 *      summary: Get all of a user's applications
 *      description: Get all of a user's applications given their user id
 *      tags: [Application]
 *      parameters:
 *          - $ref: "#/components/parameters/access_token"
 *          - in: query
 *            name: user_id
 *            description: User id of the user to get applications for
 *            required: true
 *      responses:
 *          200:
 *              description: Array of applications successfully retrieved
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: "#/components/schemas/Application"
 *          401:
 *              $ref: "#/components/responses/401unauthorized"
 *          403:
 *              $ref: "#/components/responses/403forbidden"
 *          400:
 *              $ref: "#/components/responses/400badrequest"
 *          500:
 *              $ref: "#/components/responses/500internalservererror"
 */
router.get("/user", verifyToken, getUserApplications);

/**
 * @openapi
 * 
 * /application/{id}:
 *  get:
 *      summary: Get an application
 *      description: Get an application for a user. 
 *      tags: [Application]
 *      parameters:
 *          - $ref: "#/components/parameters/access_token"
 *          - in: path
 *            name: id
 *            description: Application id
 *      responses:
 *          200:
 *              description: Application successfully retrieved
 *              content: 
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/Application"
 *          401:
 *              $ref: "#/components/responses/401unauthorized"
 *          403:
 *              $ref: "#/components/responses/403forbidden"
 *          400:
 *              $ref: "#/components/responses/400badrequest"
 *          500:
 *              $ref: "#/components/responses/500internalservererror"
 */
router.get("/:id", verifyToken, getApplication);




export default router;