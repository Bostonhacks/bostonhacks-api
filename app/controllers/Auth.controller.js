// import { auth, OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import prismaInstance from "../database/Prisma.js";
import logger from "../utils/logger.js";

const prisma = prismaInstance;

// takes in request object to figure out protocol and host if none is specified
// helper function to build redirect url used in google callback
const getRedirectUrl = (req, baseUrl, queryParams) => {
    const fallback = process.env.DEFAULT_ERROR_REDIRECT || `${req.get("host")}/docs`;

    const redirectBase = baseUrl ? baseUrl : fallback;

    const url = new URL(redirectBase.startsWith('http') ? redirectBase : `${req.protocol}://${redirectBase}`);
    // const url = new URL(redirectBase);

    // add error params
    Object.entries(queryParams).forEach(([key, val]) => {
        url.searchParams.append(key, val);
    });

    return url.toString();
}


// create new OAuth2Client instance
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const GOOGLE_OAUTH_SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
];

/*
This gauth flow assumes you are using a frontend google login client such as the one provided by google
This takes in an ID Token and does not require a client secret
If you would like to test the auth flow with a REST client such as Postman,
Use an OAuth2.0 client with implicit grant type and the following settings:
- Client ID: {your google client id}
- Authorization URL: https://accounts.google.com/o/oauth2/v2/auth
- Redirect URL: http://localhost:8000
- Response Type: ID Token
- Scope: https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile
- State: Anything

You can also choose to use any other OAuth2.0 client to get the ID Token.
Once you get the ID Token, send it to the backend in the Authorization header as a Bearer token.

This is typically handled by frontend Google login client which utilizes an Open ID Connect Token flow (not implicit grants)
*/
// export const googleAuth = async(req, res) => {
//     try {
//         // get token from front end after google sign-in button flow
//         const token = req.headers.authorization?.split(' ')[1];
            
//         if (!token) {
//             return res.status(401).json({ message: 'No token provided' });
//         }

//         // verify token and get user info from google
//         const ticket = await client.verifyIdToken({
//             idToken: token,
//             audience: process.env.GOOGLE_CLIENT_ID
//         });


//         const { email, name, given_name, picture, email_verified } = ticket.getPayload();


//         if (!email_verified) {
//             return res.status(401).json({ message: 'Email not verified' });
//         }
        
//         // return res.status(200).json(ticket.getPayload());

//         // Create or update user
//         const user = await prisma.user.upsert({
//             where: { email },
//             update: { },
//             create: {
//                 email: email,
//                 firstName: name,
//                 lastName: given_name,
//                 avatar: picture,
//                 authProvider: 'GOOGLE'
//             }
//         });

//         // Generate JWT
//         const accessToken = jwt.sign(
//             { 
//                 id: user.id,
//                 email: user.email,
//             },
//             process.env.JWT_SECRET,
//             { expiresIn: '24h' }
//         );

//         res.cookie('access_token', accessToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict',
//             maxAge: 24 * 60 * 60 * 1000 // 24 hours
//         }).status(200).json(user);

//     }
//     catch(err) {
//         res.status(500).json({
//             message: "Internal server error",
//             error: err.message
//         });
//     }

// }

/* The next two google functions are for backend google auth handling
(Backend creates google url and redirects user to sign-in).
Above, google auth is handled on frontend using google sign-in libraries
and the id token is sent to the backend for verification.
This handles all of this on the server and is more representative of the full oauth flow.
You can switch to a complete backend auth system by uncommenting
the next two functions and the routes associated with them */
export const googleAuth = async(req, res) => {
    try {
        const redirect_uri = req.query.redirect_uri;

        // require redirect_uri
        if (!redirect_uri || !redirect_uri?.startsWith("http")) {
            return res.status(400).json({
                message: "redirect_uri parameter as a valid http:// or https:// is required"
            });
        }

        const state = crypto.randomBytes(32).toString('hex');
       
        // sign cookie with jwt with state
        const oauthstate = jwt.sign({ state: state, redirect_uri: redirect_uri || undefined }, process.env.JWT_SECRET, { expiresIn: '5m' });
        
        const scopes = GOOGLE_OAUTH_SCOPES.join(" ");
        const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${process.env.GOOGLE_OAUTH_URL}?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`;

       
        res.cookie("oauthstate", oauthstate, {
            domain: process.env.NODE_ENV === "production" ? process.env.ROOT_DOMAIN : undefined,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax", // needed for redirect
            maxAge: 5 * 60 * 1000 // 5 minutes
        });

        
        res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);


    } catch(err) {
        logger.error(`googleAuth: ${err.message}`, {
            function: "googleAuth",
            // stack: err.stack,
            error: err
        });
        res.status(500).json(err);
    }
    
};

export const googleCallback = async(req, res) => {
    try {
       
        let userInfo;
        let redirect_uri;
        if (req.headers.authorization) {
            // good for testing with postman, insomnia, etc. 
            // This assumes you have already gotten an access token by means from another source (i.e. insomnia OAuth2 login with same client id)
            userInfo = await fetch(process.env.GOOGLE_TOKEN_INFO_URL, {
                headers: { Authorization: req.headers.authorization }
            }).then(res => res.json());

            if (userInfo.error) {
                return res.status(400).json({ message: "Invalid token" });
            }

            if (!userInfo.email_verified && !userInfo.verified_email) {
                // const errorRedirect = getRedirectUrl(redirect_uri, {
                //     error: "unverified_email",
                //     message: "Email not verified"
                // });
                return res.status(400).json({ message: "Email not verified" });
            }

        } else {
            // normal auth flow

            const { code } = req.query;
            const { state } = req.query;
            const oauthstateCookie = req.cookies.oauthstate;

            
            const decodedState = jwt.verify(oauthstateCookie, process.env.JWT_SECRET)
            redirect_uri = decodedState.redirect_uri;


            // check state to prevent CSRF
            if (!oauthstateCookie) {
                const errorRedirect = getRedirectUrl(req, redirect_uri, {
                    error: "missing_cookie",
                    message: "Missing state cookie"
                });

                return res.redirect(errorRedirect);
            }

            // check if state matches
            try {

                if (!state || state !== decodedState.state) {
                    const errorRedirect = getRedirectUrl(req, redirect_uri, {
                        error: "bad_state",
                        message: "Bad State"
                    });

                    return res.redirect(errorRedirect);

                }


                res.clearCookie("oauthstate", {
                    domain: process.env.NODE_ENV === "production" ? process.env.ROOT_DOMAIN : undefined,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: "lax", // needed for redirect
                    // maxAge: 5 * 60 * 1000 // 5 minutes
                });
            } catch(err) {
                logger.error(err);
                const errorRedirect = getRedirectUrl(req, redirect_uri, {
                    error: "missing_expired_state",
                    message: "Missing or expired oauth state"
                });

                return res.redirect(errorRedirect);

                // return res.redirect(errorRedirect);
                // return res.status(400).json({
                //     message: "Missing or expired oauth state",
                // });
            }

            // if state matches, then continue
        
            // exchange code for access token
            const response = await fetch(process.env.GOOGLE_ACCESS_TOKEN_URL, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code,
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
                    grant_type: "authorization_code"
                })
            });
        
            const accessToken = await response.json();
        
            if (!accessToken || accessToken?.error) {
                const errorRedirect = getRedirectUrl(req, redirect_uri, {
                    error: "invalid_authorization_code",
                    message: "Invalid OAuth Code"
                });
                
                return res.redirect(errorRedirect);
            }
            
            // get token info using access token
            userInfo = await fetch(process.env.GOOGLE_TOKEN_INFO_URL, {
                headers: { Authorization: `Bearer ${accessToken.access_token}` }
            }).then(res => res.json());

            if (!userInfo.email_verified && !userInfo.verified_email) {
                const errorRedirect = getRedirectUrl(req, redirect_uri, {
                    error: "unverified_email",
                    message: "Email not verified"
                });
                return res.redirect(errorRedirect)
            }
        
            
        }

        // Create or update user
        const user = await prisma.user.upsert({
            where: { email: userInfo.email },
            update: { },
            create: {
                email: userInfo.email,
                firstName: userInfo.name,
                lastName: userInfo.given_name,
                avatar: userInfo.picture,
                authProvider: 'GOOGLE'
            }
        });

        // Generate JWT
        const accessToken = jwt.sign(
            { 
                id: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );


        // adds messages to redirect uri as queries to give client info with redirect
        const redirectUrl = getRedirectUrl(req, redirect_uri, {
            success: true,
            message: `User ${userInfo.email} logged in successfully`,
            user: JSON.stringify(user)
        });

        logger.debug(redirectUrl)

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            domain: process.env.NODE_ENV === "production" ? process.env.ROOT_DOMAIN : undefined,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        logger.info(`User with email ${userInfo.email} logged in or created`)
        
        res.redirect(redirectUrl); 
    
        // res.status(200).json(userInfo);
    } catch(err) {
        logger.error(`googleCallback: ${err}`);
        res.status(500).json(err);
    }
    
};

export const logout = async(req, res) => {
    try {
        logger.info(`User ${req.user.id} logged out`)
        res.clearCookie("access_token", {
            // settings must be the same as the set cookie on login
            httpOnly: true,
            domain: process.env.NODE_ENV === "production" ? process.env.ROOT_DOMAIN : undefined,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            // maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }).status(200).json({
            message: "User logged out successfully",
        });
    } catch(err) {
        logger.error(`Error logging out user: ${err}`);
        res.status(500).json({
            message: "Error logging out user"
        })
    }
 
}

export const createEmailUser = async(req, res) => {
    try {
        // check if user exists already
        const existingUser = await prisma.user.findUnique({
            where: {
                email: req.body.email
            }
        });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }


        // if authprovider is email (or none specified), require password
        if (req.body.authProvider === "EMAIL") {
          
            // if (!req.body.password) {
            //     return res.status(400).json({
            //         message: "password field is required"
            //     });
            // }

            // add input validation

            // const user = await prisma.user.create({
            //     data: {
            //         email: req.body.email,
            //         firstName: req.body.firstName,
            //         lastName: req.body.lastName,
            //         // password: req.body.password, // hash this later
            //     }
            // });

            // res.status(201).json({
            //     message: "User created successfully",
            //     user: user
            // });
    

            // not yet implemented so return that

            res.status(501).json({
                message: "Not yet implemented"
            });
        }

    
    } catch(err) {
        res.status(500).json(err);
    }

}