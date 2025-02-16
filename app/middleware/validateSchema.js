
import { Prisma } from "@prisma/client";

export const validateApplication = (req, res, next) => {
    const fields = Prisma.dmmf.datamodel.models.find(model => model.name === 'Application').fields;

    const required = fields
        .filter(field => !field.isOptional && field.name !== 'id' && field.name !== 'userId' && field.name !== 'applicationYear' && field.name !== 'user' && field.name !== 'status')
        .map(field => field.name);

    const missing = required.filter(field => !req.body[field]);

    if (missing.length > 0) {
        return res.status(400).json({
            message: "Missing required fields",
            fields: missing
        });
    }

    if (req.body.age < 13 || req.body.age > 100) {
        return res.status(400).json({
            message: "Invalid age range"
        });
    }

    if (req.body.gradYear < new Date().getFullYear()) {
        return res.status(400).json({
            message: "Invalid graduation year"
        });
    }

    // Phone number validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(req.body.phoneNumber)) {
        return res.status(400).json({
            message: "Invalid phone number format"
        });
    }

    next(); 
};
