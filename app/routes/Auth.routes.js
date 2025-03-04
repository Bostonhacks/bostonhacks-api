import express from "express"
import { googleAuth, createEmailUser, googleCallback, emailLogin } from "../controllers/Auth.controller.js";

const router = express.Router();


// either google oauth or email 
// check db if using email, if so pass is required,
// if google oauth, no password required but must set
router.post("/email/signup", createEmailUser);

/**
 * @openapi
 * 
 * /google/login:
 *  get:
 *      summary: Redirect to Google OAuth login
 *      description: Redirects user to google login, calls /api/google/callback as the callback function. To authenticate in another fashion, you can create your own Google OAuth application (to get Client ID + Secret), retrieve an access token yourself with a program such as Postman/Insomnia with email and profile scopes set, then pass that to the callback function /google/callback.
 *      tags: [Auth]
 */
router.get("/google/login", googleAuth);

/**
 * @openapi
 * 
 * /google/callback:
 *  get:
 *      summary: Google oauth callback
 *      description: This gets called implicitly by Google OAuth servers. You can also get your own access token from Google and send that in the authorization header. Use the Authorization header if you fetched your own access code, otherwise the code query will be used.
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
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  example: Successfully authenticated
 *                              user:
 *                                  $ref: "#/components/schemas/User"
 *          
 */
router.get("/google/callback", googleCallback);

// google login/signup
// router.post("/google", googleAuth);


router.post("/email/login", emailLogin)

export default router;