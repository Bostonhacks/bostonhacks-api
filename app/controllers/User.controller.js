import prismaInstance from "../database/Prisma.js";

const prisma = prismaInstance;

export const createUser = async(req, res) => {
    try {
        const user = await prisma.user.create({
            data: {
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                // password: req.body.password, // hash this later
            }
        });
    
        res.status(201).json(user);
    
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