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
 *       description: Array of applications successfully retrieved (paginated).
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

router.get("/:id", getApplicationById);
router.post("/", createApplication);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

export default router;
