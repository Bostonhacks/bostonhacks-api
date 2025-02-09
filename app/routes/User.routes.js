import express from "express"
import { getUser } from "../controllers/User.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();




/**
 * @openapi
 * 
 * /api/user:
 *  get:
 *      summary: Get user info
 *      description: Retrieve user info via email, id, or both. Requires authentication token.
 *      tags: [User]
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
 *      responses:
 *          200:
 *              description: User info retrieved successfully
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: "#/components/schemas/User"
 *          403:
 *              description: Unauthorized access
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message: 
 *                                  type: string
 *                                  example: Request not allowed
 *          500:
 *              description: Internal Server Error
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: "#/components/schemas/InternalServerError"
 * 
 */
router.get("/", verifyToken, getUser);

export default router;