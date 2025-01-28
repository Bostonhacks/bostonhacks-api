import { auth, OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import prismaInstance from "../database/Prisma.js";

const prisma = prismaInstance;


// create new OAuth2Client instance
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const createGoogleUser = async(req, res) => {
    try {
    
        const authorization = req.headers.authorization;
        console.log(authorization);

        // ask for google id token
        // verify token with google
        // if verified, create user

        const ticket = await client.verifyIdToken({
            idToken: authorization,
            audience: process.env.GOOGLE_CLIENT_ID
        });



        console.log(ticket);

        const payload = ticket.getPayload();

        if (!payload) {
            return res.status(400).json({
                message: "Invalid token"
            });
        }

        const userData = {
            email: payload.email,
            firstName: payload.given_name,
            lastName: payload.family_name,
            authProvider: "GOOGLE"
        }

        const user = await prismaInstance.user.create({
            data: userData
        });

        // sign JWT token and set cookie
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: "24h" });

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }).json({
            message: "User created successfully",
            user: {
                id: user.id,
                email: user.email,
            }
        });
    
    } catch(err) {
        res.status(500).json(err);
    }
    
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