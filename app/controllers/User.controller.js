import prismaInstance from "../database/Prisma.js";

const prisma = prismaInstance;

export const createUser = async(req, res) => {
    try {

        // oauth flow or email flow

        // if authprovider is email (or none specified), require password
        if (req.body.authProvider === "EMAIL") {

            if (!req.body.password) {
                return res.status(400).json({
                    message: "password field is required"
                });
            }

            const user = await prisma.user.create({
                data: {
                    email: req.body.email,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    // password: req.body.password, // hash this later
                }
            });

            res.status(201).json({
                message: "User created successfully",
                user: user
            });
    
        }
        else if (req.body.authProvider === "GOOGLE") {
            // google oauth flow

            // ask for google id token
            // verify token with google
            // if verified, create user

            // res.status(201).json({ 
            //     message: "User created successfully",
            //     user: user 
            // });
        }
        else {
            return res.status(400).json({
                message: "authProvider field is required"
            });
        }

    
    } catch(err) {
        res.status(500).json(err);
    }

}

export const getUser = async(req, res) => {
    try {
        if (!req.query.id && !req.query.email) {
            return res.status(400).json("id or email field is required");
        }
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(req.query.id),
                email: req.query.email
            }
        });
    
        res.status(200).json(user);
    
    } catch(err) {
        res.status(500).json(err);
    }
}