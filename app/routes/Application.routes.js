import {
  createApplication,
  getApplication,
  getUserApplications,
  updateApplication,
  getResumeUrl,
} from "../controllers/Application.controller.js";
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import upload from "../middleware/upload.js";
// import { validateApplication } from "../middleware/validateSchema.js";

const router = express.Router();

/**
 * @openapi
 * 
 * /application:
 *  post:
 *      summary: Create an application. Posting to this route will submit an application for a user.
 *      description: Create an application for a user with. Later there will be support for drafts. 
 *      tags: [Application]
 *      parameters:
 *          - $ref: "#/components/parameters/access_token"
 *      requestBody:
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
 *                          pronous:
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
 *      responses:
 *          201:
 *              description: Application successfully created
 *          400:
 *              description: Missing required fields, invalid file, or validation error
 *          401:
 *              $ref: "#/components/responses/401unauthorized"
 *          403:
 *              $ref: "#/components/responses/403forbidden"
 *          500:
 *              $ref: "#/components/responses/500internalservererror"
 */
router.post("/", verifyToken, upload.single('resume'), createApplication);

/**
 * @openapi
 * 
 * /application/{id}:
 *  put:
 *      summary: Update an application
 *      description: Update an application with optional resume upload
 *      tags: [Application]
 *      parameters:
 *          - $ref: "#/components/parameters/access_token"
 *          - in: path
 *            name: id
 *            description: Application id
 *            required: true
 *      requestBody:
 *          required: true
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          gender:
 *                              type: string
 *                          pronous:
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
 *                          resume:
 *                              type: string
 *                              format: binary
 *                              description: Resume file (PDF, DOC, DOCX, max 10MB)
 *      responses:
 *          200:
 *              description: Application successfully updated
 *          400:
 *              description: Invalid input or file validation error
 *          401:
 *              $ref: "#/components/responses/401unauthorized"
 *          403:
 *              $ref: "#/components/responses/403forbidden"
 *          404:
 *              description: Application not found
 *          500:
 *              $ref: "#/components/responses/500internalservererror"
 */
router.put("/:id", verifyToken, upload.single('resume'), updateApplication);


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

/**
 * @openapi
 * 
 * /application/{id}/resume/url:
 *  get:
 *      summary: Get temporary resume URL
 *      description: Generate a temporary, short-lived URL to access the resume file
 *      tags: [Application]
 *      parameters:
 *          - $ref: "#/components/parameters/access_token"
 *          - in: path
 *            name: id
 *            description: Application id
 *            required: true
 *      responses:
 *          200:
 *              description: Temporary URL generated successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                              resumeUrl:
 *                                  type: string
 *                                  description: Temporary URL to access the resume
 *                              expiresAt:
 *                                  type: string
 *                                  format: date-time
 *                                  description: When the URL expires
 *                              expiresInMinutes:
 *                                  type: integer
 *                                  description: Minutes until expiration
 *                              notice:
 *                                  type: string
 *          401:
 *              $ref: "#/components/responses/401unauthorized"
 *          403:
 *              $ref: "#/components/responses/403forbidden"
 *          404:
 *              description: Application or resume not found
 *          500:
 *              $ref: "#/components/responses/500internalservererror"
 */
router.get("/:id/resume/url", verifyToken, getResumeUrl);

///**
// * @openapi
// * 
// * /application/{id}/resume:
// *  post:
// *      summary: Upload resume for application
// *      description: Upload a resume file for an existing application
// *      tags: [Application]
// *      parameters:
// *          - $ref: "#/components/parameters/access_token"
// *          - in: path
// *            name: id
// *            description: Application id
// *            required: true
// *      requestBody:
// *          required: true
// *          content:
// *              multipart/form-data:
// *                  schema:
// *                      type: object
// *                      properties:
// *                          resume:
// *                              type: string
// *                              format: binary
// *                              description: Resume file (PDF, DOC, DOCX, max 10MB)
// *      responses:
// *          200:
// *              description: Resume uploaded successfully
// *          400:
// *              description: Invalid file or validation error
// *          401:
// *              $ref: "#/components/responses/401unauthorized"
// *          403:
// *              $ref: "#/components/responses/403forbidden"
// *          404:
// *              description: Application not found
// *          500:
// *              $ref: "#/components/responses/500internalservererror"
// */
// router.post("/:id/resume", verifyToken, upload.single('resume'), uploadResume);

///**
// * @openapi
// * 
// * /application/{id}/resume:
// *  delete:
// *      summary: Delete resume from application
// *      description: Delete the resume file from an application
// *      tags: [Application]
// *      parameters:
// *          - $ref: "#/components/parameters/access_token"
// *          - in: path
// *            name: id
// *            description: Application id
// *            required: true
// *      responses:
// *          200:
// *              description: Resume deleted successfully
// *          401:
// *              $ref: "#/components/responses/401unauthorized"
// *          403:
// *              $ref: "#/components/responses/403forbidden"
// *          404:
// *              description: Application or resume not found
// *          500:
// *              $ref: "#/components/responses/500internalservererror"
// */
//router.delete("/:id/resume", verifyToken, deleteResume);

export default router;
