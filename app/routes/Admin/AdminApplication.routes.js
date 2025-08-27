import express from "express";
import {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication
} from "../../controllers/Admin/AdminApplication.controller.js";

const router = express.Router();

/**
 * @openapi
 * /admin/application:
 *   get:
 *     summary: Get all applications with filtering
 *     description: Admin endpoint to retrieve all applications with optional filtering and pagination
 *     tags: [Admin - Applications]
 *     parameters:
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, WAITLISTED, REJECTED]
 *       - in: query
 *         name: applicationYear
 *         schema:
 *           type: integer
 *       - in: query
 *         name: <any field>
 *         description: Any field can be used for the filter.
 *
 *     responses:
 *       200:
 *         description: Array of applications successfully retrieved (paginated).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 applications:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Application"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       403:
 *         description: Admin access required
 */
router.get("/", getAllApplications);

/**
 * @openapi
 * /admin/application/{id}:
 *   get:
 *     summary: Get application by ID
 *     description: Admin endpoint to retrieve a specific application by its ID
 *     tags: [Admin - Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The application ID
 *     responses:
 *       200:
 *         description: Application successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Application"
 *       404:
 *         description: Application not found
 *       403:
 *         description: Admin access required
 */
router.get("/:id", getApplicationById);

/**
 * @openapi
 * /admin/application:
 *   post:
 *     summary: Create a new application
 *     description: Admin endpoint to create a new application
 *     tags: [Admin - Applications]
 *     requestBody:
 *          required: true
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          userId:
 *                              type: string
 *                          gender:
 *                              type: string
 *                          pronouns:
 *                              type: string
 *                          age:
 *                              type: integer
 *                          ethnicity:
 *                              type: string
 *                          gradYear:
 *                              type: integer
 *                          phoneNumber:
 *                              type: string
 *                          school:
 *                              type: string
 *                          city:
 *                              type: string
 *                          state:
 *                              type: string
 *                          country:
 *                              type: string
 *                          educationLevel:
 *                              type: string
 *                          major:
 *                              type: string
 *                          diet:
 *                              type: string
 *                          shirtSize:
 *                              type: string
 *                          sleep:
 *                              type: boolean
 *                          github:
 *                              type: string
 *                          linkedin:
 *                              type: string
 *                          portfolio:
 *                              type: string
 *                          whyBostonhacks:
 *                              type: string
 *                          applicationYear:
 *                              type: integer
 *                          resume:
 *                              type: string
 *                              format: binary
 *                              description: Resume file (PDF, DOC, DOCX, max 10MB)
 *
 *     responses:
 *       201:
 *         description: Application successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Application"
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Admin access required
 */
router.post("/", createApplication);

/**
 * @openapi
 * /admin/application/{id}:
 *   put:
 *     summary: Update an application
 *     description: Admin endpoint to update an existing application. Almost all fields are updatable with this.
 *     tags: [Admin - Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The application ID
 *     requestBody:
 *          required: true
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          userId:
 *                              type: string
 *                          gender:
 *                              type: string
 *                          pronouns:
 *                              type: string
 *                          age:
 *                              type: integer
 *                          ethnicity:
 *                              type: string
 *                          gradYear:
 *                              type: integer
 *                          phoneNumber:
 *                              type: string
 *                          school:
 *                              type: string
 *                          city:
 *                              type: string
 *                          state:
 *                              type: string
 *                          country:
 *                              type: string
 *                          educationLevel:
 *                              type: string
 *                          major:
 *                              type: string
 *                          diet:
 *                              type: string
 *                          shirtSize:
 *                              type: string
 *                          sleep:
 *                              type: boolean
 *                          github:
 *                              type: string
 *                          linkedin:
 *                              type: string
 *                          portfolio:
 *                              type: string
 *                          whyBostonhacks:
 *                              type: string
 *                          applicationYear:
 *                              type: integer
 *                          resume:
 *                              type: string
 *                              format: binary
 *                              description: Resume file (PDF, DOC, DOCX, max 10MB)
 *
 *     responses:
 *       200:
 *         description: Application successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Application"
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Application not found
 *       403:
 *         description: Admin access required
 */
router.put("/:id", updateApplication);

/**
 * @openapi
 * /admin/application/{id}:
 *   delete:
 *     summary: Delete an application
 *     description: Admin endpoint to delete an application
 *     tags: [Admin - Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The application ID
 *     responses:
 *       200:
 *         description: Application successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Application deleted successfully"
 *       404:
 *         description: Application not found
 *       403:
 *         description: Admin access required
 */
router.delete("/:id", deleteApplication);

export default router;
