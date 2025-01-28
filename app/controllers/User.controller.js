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
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    req.query.id ? { id: parseInt(req.query.id) } : null,
                    req.query.email ? { email: req.query.email } : null
                ].filter(Boolean) // Removes any null entries from the array
            }
        });
    
        res.status(200).json(user);
    
    } catch(err) {
        console.log(err);
        res.status(500).json(err);
    }
}

export const deleteUser = async(req, res) => {
    try {
        if (!req.query.id && !req.query.email) {
            return res.status(400).json("id or email field is required");
        }
        var condition = {}
        if (req.query.id) {
            condition = {id: parseInt(req.query)}
        }
        else if (req.query.email) {
            condition = {email: req.query.email}
        }
        
        const user = await prisma.user.delete({
            where: condition
        });
    
        res.status(200).json(user);
    
    } catch(err) {
        console.log(err);
        res.status(500).json(err);
    }
}