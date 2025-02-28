import express from "express"
import { googleAuth, createEmailUser, googleCallback, logout } from "../controllers/Auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

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
 *      description: Redirects user to google login, calls /google/callback as the callback function. To authenticate in another fashion, you can create your own Google OAuth application (to get Client ID + Secret), retrieve an access token yourself with a program such as Postman/Insomnia with email and profile scopes set, then pass that to the callback function /google/callback.
 *      tags: [Auth]
 *      parameters:
 *          - in: query
 *            name: redirect_uri
 *            required: true
 *            schema:
 *              type: string
 *              description: Where to send user after error or login. Query parameters "error" or "success" or "message" will be attached to the url, and the user redirected to the specified redirect_uri?queries
 *          
 */
router.get("/google/login", googleAuth);

/**
 * @openapi
 * 
 * /google/callback:
 *  get:
 *      summary: Google oauth callback
 *      description: This gets called implicitly by Google OAuth servers. You can also get your own access token from Google and send that in the authorization header. Use the Authorization header if you fetched your own access code, otherwise the code query will be used. If you are using Postman/Insomnia, you can verify logged in status by seeing if you get an access_token cookie.
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
 *              description: Redirects to client's redirect_uri specified when first logging in with query parameters. On error, (error=err_message). On success, (success=true, user=jsoned_user)), always (message="message") attached to the url
 *          
 */
router.get("/google/callback", googleCallback);

router.post("/logout", verifyToken, logout)

// google login/signup
// router.post("/google", googleAuth);

export default router;