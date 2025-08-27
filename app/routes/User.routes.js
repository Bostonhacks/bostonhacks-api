import express from "express"
import { getSelf, getUser, updateUser } from "../controllers/User.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();




/**
 * @openapi
 * 
 * /user:
 *  get:
 *      summary: Get user info
 *      description: Retrieve user info via email, id, or both. Requires authentication token.
 *      tags: [User]
 *      security:
 *          - accessToken: []
 *      parameters:
 *          - in: cookie
 *            name: access_token
 *            description: Login token
 *            required: true
 *            schema:
 *              type: string
 *          - in: query
 *            name: email
 *          - in: query
 *            name: id
 *          - in: query
 *            name: include
 *            description: Include projects and applications data
 *            schema:
 *              type: boolean
 *              example: true
 *      responses:
 *          200:
 *              description: User info retrieved successfully. Includes truncated application and projects data.
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: "#/components/schemas/User"
 *          403:
 *              $ref: "#/components/responses/403forbidden"
 *          401:
 *              $ref: "#/components/responses/401unauthorized"
 *          500:
 *              $ref: "#/components/responses/500internalservererror"
 */
router.get("/", verifyToken, getUser);


/**
 * @openapi
 * 
 * /user/me:
 *  get:
 *      summary: Get basic user info
 *      description: Lightweight endpoint to retrieve user info based on login cookie. Only returns user's id and email. Use /user to find full user info
 *      tags: [User]
 *      parameters:
 *          - in: cookie
 *            name: access_token
 *            description: Login token
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: User info retrieved successfully. Includes truncated application and projects data.
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                             id:
 *                                type: string
 *       
 */
router.get("/me", verifyToken, getSelf);

// update user should prevent updates to certain fields
/**
 * @openapi
 * 
 * /user/{id}:
 *  put:
 *      summary: Update user information
 *      description: Update user's firstName and lastName. Users can only update their own information.
 *      tags: [User]
 *      security:
 *          - accessToken: []
 *      parameters:
 *          - in: cookie
 *            name: access_token
 *            description: Login token
 *            required: true
 *            schema:
 *              type: string
 *          - in: path
 *            name: id
 *            description: User ID to update
 *            required: true
 *            schema:
 *              type: string
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          firstName:
 *                              type: string
 *                              description: User's first name
 *                          lastName:
 *                              type: string
 *                              description: User's last name
 *      responses:
 *          200:
 *              description: User updated successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: "#/components/schemas/User"
 *          400:
 *              description: Bad request - missing ID parameter or invalid request data
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                              error:
 *                                  type: array
 *          403:
 *              $ref: "#/components/responses/403forbidden"
 *          401:
 *              $ref: "#/components/responses/401unauthorized"
 *          500:
 *              $ref: "#/components/responses/500internalservererror"
 */
router.put("/:id", verifyToken, updateUser);

export default router;
