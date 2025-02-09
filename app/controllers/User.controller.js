import prismaInstance from "../database/Prisma.js";

const prisma = prismaInstance;



export const getUser = async(req, res) => {
    try {
        if (!req.query.id && !req.query.email) {
            return res.status(400).json("id or email field is required");
        }

        // verify logged in user matches requested user
        if ((req.query.id && req.user.id !== parseInt(req.query.id)) || (req.query.email && req.user.email !== req.query.email)) {
            return res.status(403).json({
                message: "You are not authorized to access this resource"
            });
        }
        
        if (req.query.id) {
            const user = await prisma.user.findUnique({
                where: {
                    id: parseInt(req.query.id),
                }
            });
            return res.status(200).json(user);
        }
        else if (req.query.email) {
            const user = await prisma.user.findUnique({
                where: {
                    email: req.query.email,
                }
            });
            return res.status(200).json(user);
        }


    
        res.status(200).json(user);
    
    } catch(err) {
        res.status(500).json({
            message: "Something went wrong",
            error: err
        });
    }
}