import express from "express"
import { getUser } from "../controllers/User.controller.js";
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

// update user should prevent updates to certain fields
// router.put("/:id", verifyToken, updateUser);

export default router;