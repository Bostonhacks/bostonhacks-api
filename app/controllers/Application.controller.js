import prismaInstance from "../database/Prisma.js";

const prisma = prismaInstance;

export const createApplication = async(req, res) => {
    try {
        const user = await prisma.user.create({
            data: {
                age: req.body.age,
                city: req.body.city,
                country: req.body.country,
                diet: req.body.diet,
                educationLevel: req.body.educationLevel,
                ethnicity: req.body.ethnicity,
                gender: req.body.gender,
                github: req.body.github,
                gradYear: req.body.gradYear,
                linkedin: req.body.linkedin,
                major: req.body.major,
                phoneNumber: req.body.phoneNumber,
                portfolio: req.body.portfolio,
                pronouns: req.body.pronouns,
                school: req.body.school,
                shirtSize: req.body.shirtSize,
                sleep: req.body.sleep,
                state: req.body.state,
                whyBostonhacks: req.body.whyBostonhacks,                
            }
        });
    
        res.status(201).json(user);
    
    } catch(err) {
        res.status(500).json(err);
    }

}

export const getApplication = async(req, res) => {
    try {
        if (!req.query.id && !req.query.userId && !req.query.phoneNumber) {
            return res.status(400).json("id, userId, or phoneNumber field is required");
        }
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(req.query.id),
                userId: req.query.userId,
                phoneNumber: req.query.phoneNumber
            }
        });
    
        res.status(200).json(user);
    
    } catch(err) {
        res.status(500).json(err);
    }
}

export const deleteApplication = async(req, res) => {
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