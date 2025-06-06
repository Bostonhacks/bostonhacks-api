// import { auth, OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prismaInstance from "../database/Prisma.js";
import logger from "../utils/logger.js";

const prisma = prismaInstance;


// create new OAuth2Client instance
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email"

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
export const googleAuth = async (req, res) => {
  try {
    const { redirect_uri } = req.query;
    let { error_uri } = req.query;

    // check if uris have http or https
    if (redirect_uri && !/^https?:\/\//.test(redirect_uri)) {
      return res.status(400).json({
        message: "Invalid redirect_uri"
      });
    }
    if (error_uri && !/^https?:\/\//.test(error_uri)) {
      return res.status(400).json({
        message: "Invalid error_uri"
      });
    }
    // if redirect_uri or error_uri is not provided if one is provided, return
    if (redirect_uri && !error_uri) {
      error_uri = redirect_uri;
    }

    // logger.info("Redirecting to Google OAuth consent screen");
    const state = crypto.randomBytes(32).toString('hex');

    const token = {
      state: state,
      redirect_uri: redirect_uri || null,
      error_uri: error_uri || null
    }
    // remove null from token
    Object.keys(token).forEach(key => token[key] == null && delete token[key]);

    // sign cookie with jwt with state
    const oauthstate = jwt.sign(token, process.env.JWT_SECRET, { expiresIn: '5m' });

    const scopes = GOOGLE_OAUTH_SCOPES.join("%20");
    const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${process.env.GOOGLE_OAUTH_URL}?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`;


    res.cookie("oauthstate", oauthstate, {
      domain: process.env.NODE_ENV === "production" ? process.env.ROOT_DOMAIN : undefined,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && process.env.LOCAL_DEV !== "true",
      sameSite: "lax", // needed for redirect
      maxAge: 5 * 60 * 1000 // 5 minutes
    });


    // res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);
    res.status(200).json({
      message: "Redirecting to Google OAuth consent screen",
      url: GOOGLE_OAUTH_CONSENT_SCREEN_URL
    });


  } catch (err) {
    logger.error(err);
    res.status(500).json(err);
  }

};

export const googleCallback = async (req, res) => {
  try {

    let userInfo;
    let redirect_uri;
    let error_uri;
    if (req.headers.authorization) {
      // good for testing with postman, insomnia, etc. 
      // This assumes you have already gotten an access token by means from another source (i.e. insomnia OAuth2 login with same client id)
      userInfo = await fetch(process.env.GOOGLE_TOKEN_INFO_URL, {
        headers: { Authorization: req.headers.authorization }
      }).then(res => res.json());

    } else {
      // normal auth flow

      const { code } = req.query;
      const { state } = req.query;


      // check state to prevent CSRF
      const oauthstateCookie = req.cookies.oauthstate;
      logger.info(oauthstateCookie)
      if (!oauthstateCookie) {
        return res.status(400).json({
          message: "Missing OAuth State"
        })
      }


      // check if state matches
      try {
        const decodedState = jwt.verify(oauthstateCookie, process.env.JWT_SECRET)
        if (!state || state !== decodedState.state) {
          return res.status(409).json({
            message: "Invalid token state"
          })
        }

        redirect_uri = decodedState.redirect_uri;
        error_uri = decodedState.error_uri || redirect_uri;

        res.clearCookie("oauthstate", {
          domain: process.env.NODE_ENV === "production" ? process.env.ROOT_DOMAIN : undefined,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: "lax", // needed for redirect
          // maxAge: 5 * 60 * 1000 // 5 minutes
        });
      } catch (err) {
        logger.error(err)

        if (error_uri) {
          return res.redirect(`${error_uri}?success=false&error=invalidState`);
        }

        return res.status(400).json({
          message: "Missing or expired oauth state",
        });
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
        if (error_uri) {
          return res.redirect(`${error_uri}?success=false&error=invalidCode`);
        }
        return res.status(400).json({
          message: "Invalid code"
        });
      }

      // get token info using access token
      userInfo = await fetch(process.env.GOOGLE_TOKEN_INFO_URL, {
        headers: { Authorization: `Bearer ${accessToken.access_token}` }
      }).then(res => res.json());


      // logger.debug(JSON.stringify(userInfo, undefined, 2));

      if (!userInfo.email_verified && !userInfo.verified_email) {
        if (error_uri) {
          return res.redirect(`${error_uri}?success=false&error=emailNotVerified`);
        }
        return res.status(401).json({ message: 'Email not verified' });
      }


    }

    // Create or update user
    const user = await prisma.user.upsert({
      where: { email: userInfo.email },
      update: {},
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
        role: user.role || "USER", // ensure role is included in the token, default to USER if not set
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`User with email ${userInfo.email} logged in or created`)

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      domain: process.env.NODE_ENV === "production" ? process.env.ROOT_DOMAIN : undefined,
      secure: process.env.NODE_ENV === 'production' && process.env.LOCAL_DEV !== "true",
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })

    if (redirect_uri) {
      logger.info("Redirecting to: " + redirect_uri);
      return res.redirect(`${redirect_uri}?success=true&message=successfulLogin&user=${JSON.stringify(user)}`);
    }
    return res.status(200).json({
      message: "User logged in successfully",
      user: user
    });


    // res.status(200).json(userInfo);
  } catch (err) {
    logger.error(`${err}`);


    // if zoderror, return the error message
    if (err.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        error: err.errors
      });
    }


    res.status(500).json(err);
  }

};

export const logout = async (req, res) => {
  try {
    logger.info(`User ${req.user?.id} logged out`)
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
  } catch (err) {
    logger.error(`Error logging out user: ${err.message}`);
    res.status(500).json({
      message: "Error logging out user"
    })
  }

}

export const emailLogin = async (req, res) => {
  try {
    // Input validation
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find user by email
    const existingUser = await prisma.user.findUnique({
      where: {
        email: req.body.email
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true, // must explicitly select password since omitted by default
        authProvider: true,
        role: true
      }
    });

    // Check if user exists
    if (!existingUser) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Check if user is using email auth method
    if (existingUser.authProvider !== 'EMAIL') {
      return res.status(400).json({
        message: `This account uses ${existingUser.authProvider} authentication. Please login with that method.`
      });
    }

    // Verify password
    if (!existingUser.password) {
      return res.status(401).json({
        message: "Account requires password reset"
      });
    }

    const validPassword = await bcrypt.compare(req.body.password, existingUser.password);
    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Generate JWT
    const accessToken = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role || "USER" // ensure role is included in the token, default to USER if not set
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`User with email ${existingUser.email} logged in`);

    // remove password from response
    const { password, ...userWithoutPassword } = existingUser;


    res.cookie('access_token', accessToken, {
      httpOnly: true,
      domain: process.env.NODE_ENV === "production" ? process.env.ROOT_DOMAIN : undefined,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }).status(200).json({
      message: "User logged in successfully",
      user: userWithoutPassword
    });
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(500).json({
      message: "Internal server error during login"
    });
  }
};

export const createEmailUser = async (req, res) => {
  try {
    const allowEmailSignup = process.env.EMAIL_SIGNUP ? process.env.EMAIL_SIGNUP === "true" : false;
    if (!allowEmailSignup) {
      return res.status(501).json({
        message: "Email signup is not enabled"
      });
    }

    // Input validation
    // change to use validate schema middleware
    if (!req.body.email || !req.body.password || !req.body.firstName || !req.body.lastName) {
      return res.status(400).json({
        message: "Email, password, firstName, and lastName are required"
      });
    }
    // logger.debug(JSON.stringify(req.body, undefined, 2));

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(req.body.email)) {
      logger.debug(`Invalid email format: ${req.body.email}`);
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    // Password strength validation
    if (req.body.password.length < 8) {
      logger.debug("Password too short");
      return res.status(400).json({
        message: "Password must be at least 8 characters long"
      });
    }

    // Check if user exists already
    const existingUser = await prisma.user.findUnique({
      where: {
        email: req.body.email
      }
    });

    if (existingUser) {
      logger.debug(`User with email ${req.body.email} already exists`);
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: hashedPassword,
        authProvider: 'EMAIL'
      }
    });

    // Generate JWT
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`User with email ${user.email} created`);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      domain: process.env.NODE_ENV === "production" ? process.env.ROOT_DOMAIN : undefined,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }).status(201).json({
      message: "User created successfully",
      user: user
    });
  } catch (err) {
    logger.error(`User creation error: ${err.message}`);
    res.status(500).json({
      message: "Internal server error during user creation"
    });
  }
};
