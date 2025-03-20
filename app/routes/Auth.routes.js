import express from "express"
import { googleAuth, createEmailUser, googleCallback, emailLogin, logout } from "../controllers/Auth.controller.js";

const router = express.Router();


// either google oauth or email 
// check db if using email, if so pass is required,
// if google oauth, no password required but must set

/**
 * @openapi
 * 
 * /email/signup:
 *  post:
 *      summary: Signs up user via email
 *      description: 
 *      requestBody:
 *         required: true
 *         content:
 *           application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *                firstName:
 *                  type: string
 *                lastName:
 *                  type: string
 *      tags: [Auth]
 */
router.post("/email/signup", createEmailUser);

/**
 * @openapi
 * 
 * /google/login:
 *  get:
 *      summary: Provide to Google OAuth login
 *      description: Returns URL to initiate GAuth flow. Clients should use this URL and redirect themselves to prevent CORS errors. To authenticate in another fashion, you can create your own Google OAuth application (to get Client ID + Secret), retrieve an access token yourself with a program such as Postman/Insomnia with email and profile scopes set, then pass that to the callback function /google/callback. Completing this auth flow will either return a JSON object of user data or redirect to the given redirect_uri with response fields as queries
 *      tags: [Auth]
 *      parameters:
 *          - in: query
 *            name: redirect_uri
 *            description: Redirect URI after successful login. If not included, will default to return JSON response of user data
 *            schema:
 *              type: string
 *              
 *          - in: query
 *            name: error_uri
 *            description: Redirect URI if error occurs. Defaults to redirect_uri if not provided
 *            schema:
 *              type: string
 *              
 *      responses:
 *          200:
 *             description: Google OAuth URL. An oauthstate cookie is also set for the callback to user later.
 *             content: 
 *              application/json:
 *                 schema:
 *                  type: object
 *                  properties:
 *                      message:
 *                         type: string  
 *                      url: 
 *                         type: string
 *         
 * 
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
 *          redirect:
 *              description: Redirects to redirect_uri if provided with queries of response and sets auth cookie. redirect_uri?success=true&user=json_user_data&message=message
 *          redirect_error:
 *              description: Redirects to redirect_uri/error_uri if provided with queries of response. redirect_uri?success=false&error=error_message
 *          
 */
router.get("/google/callback", googleCallback);

router.post("/logout", logout);

// google login/signup
// router.post("/google", googleAuth);

/**
 * @openapi
 * 
 * /email/login:
 *  post:
 *      summary: Logs in user via email
 *      description: 
 *      requestBody:
 *          required: true
 *          content:
 *             application/json:
 * 
 *              schema:
 *                  type: object
 *                  properties:
 *                      email: 
 *                          type: string
 *                      password:
 *                          type: string
 * 
 *      tags: [Auth]
 */
router.post("/email/login", emailLogin)

export default router;
