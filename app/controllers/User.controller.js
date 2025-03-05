import prismaInstance from "../database/Prisma.js";
import logger from "../utils/logger.js";

const prisma = prismaInstance;


export const getUser = async(req, res) => {
    try {
        if (!req.query.id && !req.query.email) {
            return res.status(400).json({
                message: "id or email query is required"
            });
        }

        // verify logged in user matches requested user
        if ((req.query.id && req.user.id !== req.query.id) || (req.query.email && req.user.email !== req.query.email)) {
            logger.warn(`Attempted unauthorized access to user with id ${req.query.id} or email ${req.query.email}`);
            return res.status(403).json({
                message: "You are not authorized to access this resource"
            });
        }
        
        if (req.query.id) {
            const user = await prisma.user.findUnique({
                where: {
                    id: req.query.id,
                },
                include: {
                    applications: true
                }
            });
            logger.info(`User with id ${req.query.id} retrieved`)
            return res.status(200).json(user);
        }
        else if (req.query.email) {
            const user = await prisma.user.findUnique({
                where: {
                    email: req.query.email,
                },
                include: {
                    applications: true  
                }
            });
            logger.info(`User with email ${req.query.email} retrieved`)
            return res.status(200).json(user);
        }


    
        res.status(400).json({
            message: "id or email field is required"
        });
    
    } catch(err) {
        logger.error(err);
        res.status(500).json({
            message: "Something went wrong",
            error: err
        });
    }
}