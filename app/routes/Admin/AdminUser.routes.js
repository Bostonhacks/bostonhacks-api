import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "../../controllers/Admin/AdminUser.controller.js";

const router = express.Router();

/**
 * @openapi
 * /admin/user:
 *   get:
 *     summary: Get all users with filtering
 *     description: Admin endpoint to retrieve all users with optional filtering and pagination
 *     tags: [Admin - User]
 *     parameters:
 *       - $ref: "#/components/parameters/access_token"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *       - in: query
 *         name: firstName
 *         schema:
 *           type: string
 *       - in: query
 *         name: lastName
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN]
 *       - in: query
 *         name: authProvider
 *         schema:
 *           type: string
 *           enum: [EMAIL, FACEBOOK, GOOGLE]
 *       - in: query
 *         name: include
 *         schema:
 *           type: boolean
 *         description: Include related data (projects, applications, judge)
 *       - in: query
 *         name: <any user field>
 *         description: Any user field can be used for filtering
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllUsers);

/**
 * @openapi
 * /admin/user/{id}:
 *   get:
 *     summary: Get specific user by ID
 *     description: Admin endpoint to retrieve a specific user by ID
 *     tags: [Admin - User]
 *     security:
 *       - accessToken: []
 *     parameters:
 *       - $ref: "#/components/parameters/access_token"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: include
 *         schema:
 *           type: boolean
 *         description: Include related data
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
router.get("/:id", getUserById);

/**
 * @openapi
 * /admin/user:
 *   post:
 *     summary: Create new user
 *     description: Admin endpoint to create a new user
 *     tags: [Admin - User]
 *     security:
 *       - accessToken: []
 *     parameters:
 *       - $ref: "#/components/parameters/access_token"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               avatar:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *               authProvider:
 *                 type: string
 *                 enum: [EMAIL, FACEBOOK, GOOGLE]
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User with email already exists
 *       403:
 *         description: Admin access required
 */
router.post("/", createUser);

/**
 * @openapi
 * /admin/user/{id}:
 *   put:
 *     summary: Update user
 *     description: Admin endpoint to update a user
 *     tags: [Admin - User]
 *     security:
 *       - accessToken: []
 *     parameters:
 *       - $ref: "#/components/parameters/access_token"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
router.put("/:id", updateUser);

/**
 * @openapi
 * /admin/user/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Admin endpoint to delete a user
 *     tags: [Admin - User]
 *     security:
 *       - accessToken: []
 *     parameters:
 *       - $ref: "#/components/parameters/access_token"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
router.delete("/:id", deleteUser);

export default router;
