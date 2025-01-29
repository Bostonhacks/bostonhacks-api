import { auth, OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import prismaInstance from "../database/Prisma.js";

const prisma = prismaInstance;


// create new OAuth2Client instance
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const GOOGLE_OAUTH_SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
];

export const googleAuth = async(req, res) => {
    try {

        const state = crypto.randomBytes(32).toString('hex');
        const scopes = GOOGLE_OAUTH_SCOPES.join(" ");
        const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${process.env.GOOGLE_OAUTH_URL}?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`;
        // console.log(GOOGLE_OAUTH_CONSENT_SCREEN_URL);

        // req.session.oauthstate = state;

        res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);

    
        // const authorization = req.headers.authorization;
        // // console.log(authorization);

        // // ask for google id token
        // // verify token with google
        // // if verified, create user

        // const ticket = await client.verifyIdToken({
        //     idToken: authorization,
        //     audience: process.env.GOOGLE_CLIENT_ID
        // });



        // console.log(ticket);

        // const payload = ticket.getPayload();

        // if (!payload) {
        //     return res.status(400).json({
        //         message: "Invalid token"
        //     });
        // }

        // const userData = {
        //     email: payload.email,
        //     firstName: payload.given_name,
        //     lastName: payload.family_name,
        //     authProvider: "GOOGLE"
        // }

        // const user = await prismaInstance.user.create({
        //     data: userData
        // });

        // // sign JWT token and set cookie
        // const token = jwt.sign({
        //     id: user.id,
        //     email: user.email,
        //     role: user.role
        // }, process.env.JWT_SECRET, { expiresIn: "24h" });

        // res.cookie("access_token", token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     sameSite: "strict",
        //     maxAge: 24 * 60 * 60 * 1000 // 24 hours
        // }).json({
        //     message: "User created successfully",
        //     user: {
        //         id: user.id,
        //         email: user.email,
        //     }
        // });
    
    } catch(err) {
        res.status(500).json(err);
    }
    
};

export const googleCallback = async(req, res) => {
    const { code, state } = req.query;

    // check if state matches
    // if (!state || state !== req.session.oauthstate) {
    //     return res.status(400).json({
    //         message: "Invalid state"
    //     });
    // }

    // delete req.session.oauthstate;

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
        return res.status(400).json({
            message: "Invalid code"
        });
    }
    
    // get token info
    const userInfo = await fetch(process.env.GOOGLE_TOKEN_INFO_URL, {
        headers: { Authorization: `Bearer ${accessToken.access_token}` }
    }).then(res => res.json());

    // create user if not already exists

    res.status(200).json(userInfo);
};

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