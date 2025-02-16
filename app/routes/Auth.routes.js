import express from "express"
import { googleAuth, createEmailUser, googleCallback } from "../controllers/Auth.controller.js";

const router = express.Router();

// should ideally be email or oauth login using JWT cookies set as HTTPOnly and SameSite
router.get("/login", ()=>{});

// either google oauth or email 
// check db if using email, if so pass is required,
// if google oauth, no password required but must set
router.post("/signup/email", createEmailUser);

/**
 * @openapi
 * 
 * /google/login:
 *  get:
 *      summary: Redirect to Google OAuth login
 *      description: Redirects user to google login, calls /api/google/callback as the callback function
 *      tags: [Auth]
 */
router.get("/google/login", googleAuth);

/**
 * @openapi
 * 
 * /google/callback:
 *  get:
 *      summary: Google oauth callback
 *      description: This gets called implicitly by Google OAuth servers. You can also get your own access token from Google and send that in the authorization header
 *      tags: [Auth]
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            schema:
 *              type: string
 *              example: Bearer <token> 
 * 
 *          - in: query
 *            name: code
 *            schema:
 *              type: string
 *              description: Code from google oauth
 *      responses:
 *          200:
 *              description: Successfully authenticated
 *          
 */
router.get("/google/callback", googleCallback);

// google login/signup
// router.post("/google", googleAuth);

export default router;