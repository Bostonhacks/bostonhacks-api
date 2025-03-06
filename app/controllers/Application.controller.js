import prismaInstance from "../database/Prisma.js";
import logger from "../utils/logger.js";


const prisma = prismaInstance;

export const getApplication = async(req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({
                message: "id parameter is required"
            });
        }

        const application = await prisma.application.findUnique({
            where: {
                id: req.params.id,
            }
        });

        // verify logged in user matches requested user
        if (req.user.id !== application?.userId) {
            logger.warn(`Attempted unauthorized access to application with id ${req.params.id}`);
            return res.status(403).json({
                message: "You are not authorized to access this resource"
            });
        }
        
        
        logger.info(`Application with id ${req.params.id} retrieved`)

        return res.status(200).json(application);
    } catch(err) {
        logger.error(err);
        return res.status(500).json({
            message: "Something went wrong",
            error: err
        });
    }
}

export const getUserApplications = async(req, res) => {
    try {
        if (!req.query.user_id) {
            return res.status(400).json({
                message: "id field is required"
            });
        }

        // verify logged in user matches requested user
        if (req.user.id !== req.query.user_id) {
            logger.warn(`Attempted unauthorized access to application with id ${req.query.user_id}`);
            logger.debug(`User id: ${req.user.id} | Application id: ${req.params.id}`);

            return res.status(403).json({
                message: "You are not authorized to access this resource"
            });
        }
        
        const applications = await prisma.application.findMany({
            where: {
                userId: req.query.user_id,
            }
        });
        logger.info(`Applications for user with id ${req.query.user_id} retrieved`)

        return res.status(200).json(applications);
    } catch(err) {
        logger.error(err);
        return res.status(500).json({
            message: "Something went wrong",
            error: err
        });
    }
}

export const createApplication = async (req, res) => {
    try {


        const { userId } = req.body;

        // auth
        if (!userId) {
            return res.status(400).json({
                message: "userId field is required"
            });
        }
        else if (req.user.id !== userId) {
            logger.warn(`Attempted unauthorized access to create application for user with id ${userId}`);
            return res.status(403).json({
                message: "You are not authorized to access this resource"
            });
        }

        // check if correct year
        if (req.body.applicationYear !== new Date().getFullYear()) {
            return res.status(400).json({
                message: "Invalid application year"
            });
        }

        // check if user already has application for current year
        const existingApplication = await prisma.application.findFirst({
            where: {
                userId: userId,
                applicationYear: req.body.applicationYear
            }
        });
        if (existingApplication) {
            return res.status(400).json({
                message: "User already has an application for this year"
            });
        }

        const applicationData = {
            userId: req.user.id,
            gender: req.body.gender,
            pronous: req.body.pronous,
            age: req.body.age,
            ethnicity: req.body.ethnicity,
            gradYear: req.body.gradYear,
            phoneNumber: req.body.phoneNumber,
            school: req.body.school,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            educationLevel: req.body.educationLevel,
            major: req.body.major,
            diet: req.body.diet,
            shirtSize: req.body.shirtSize,
            sleep: Boolean(req.body.sleep),
            github: req.body.github,
            linkedin: req.body.linkedin,
            portfolio: req.body.portfolio,
            whyBostonhacks: req.body.whyBostonhacks,
            applicationYear: req.body.applicationYear
        };

        // uses zod for input validation
        const application = await prisma.application.create({
            data: applicationData
        });

        logger.info(`Application with id ${application.id} created by user with id ${req.user.id}`)

        return res.status(201).json({
            message: "Application created successfully",
            application: application
        });
    } catch (err) {
        logger.error(`createApplication(): ${err}`);

        return res.status(500).json({
            message: "Something went wrong",
            error: err
        });
    }
}