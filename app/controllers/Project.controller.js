import prismaInstance from "../database/Prisma.js";
import logger from "../utils/logger.js";

const prisma = prismaInstance;

// create project
export const createProject = async (req, res) => {
    try {

        // get member array
        const members = req.body.members;
        if (!members || members.length === 0) {
            return res.status(400).json({ message: "members array field is required" });
        }

        if (req.body.year !== new Date().getFullYear()) {
            return res.status(400).json({ message: "Invalid year" });
        }

        // figure out if members already have a project for this year
        const usersWithProjects = await prisma.user.findMany({
            where: {
                id: {
                    in: members
                },
            },
            select: {
                projects: {
                    where: {
                        year: new Date().getFullYear()
                    },
                    select: {
                        id: true
                    }
                },
                email: true
            }

        });

        for (const user of usersWithProjects) {
            if (user?.projects?.length > 0) {
                return res.status(400).json({ message: `User ${user.email} already has a project for this year (${new Date().getFullYear()})` });
            }
        }


        // Create project. Validated with zod. See app/database/prisma.js for validations
        const project = await prisma.project.create({
            data: { 
                ...req.body,
                members: {
                    connect: members.map(userId => ({ id: userId }))
                }
            }
        });

        res.status(201).json({ message: "Project created", project });
    } catch (err) {
        logger.error(`createProject(): ${err}`);

        // if zoderror, return the error message
        if (err.name === "ZodError") {
            return res.status(400).json({
                message: "Validation error",
                error: err.errors
            });
        }

        res.status(500).json({ message: "Internal server error", error: err });
    }
};

// get project
export const getProject = async (req, res) => {
    try {
        const { id } = req.params;

        // get project if user is the owner
        const project = await prisma.project.findUnique({
            where: { 
                id: id
            }
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        return res.status(200).json(project);
    } catch (error) {
        logger.error(`getProject(): ${error}`);
        return res.status(500).json({ message: "Internal server error", error: "" });
    }
};


// update project
export const updateProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await prisma.project.findUnique({
            where: { id: id },
            include: {
                members: {
                    select: {
                        id: true
                    }
                }

            }
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        logger.debug(JSON.stringify(project, undefined, 2));

        // Check if user is the owner of the project
        if (!project?.members?.some(member => member.id === req.user.id)) {
            return res.status(403).json({ message: "You are not authorized to update this project" });
        }

        // check if project is already judged, if so, no updates
        if (project?.scores?.length > 0) {
            return res.status(403).json({ message: "Project has already been judged. No updates allowed" });
        }

        // if we have no members, add the current user
        if (!req.body.members) {
            req.body.members = [];
            req.body.members.push(req.user.id);
        }

        const updatedProject = await prisma.project.update({
            where: { id: id },
            data: {
                ...req.body,
                members: {
                    connect: req.body.members?.map(userId => ({ id: userId }))
                }
            },
            include: {
                members: {
                    select: {
                        email: true,
                        id: true
                    }
                }
            }
        });

        return res.status(200).json({ message: "Project updated", updatedProject });
    } catch (err) {
        logger.error(`updateProject(): ${err}`);

        // if zoderror, return the error message
        if (err.name === "ZodError") {
            return res.status(400).json({
                message: "Validation error",
                error: err.errors
            });
        }
        
        return res.status(500).json({ message: "Internal server error", error: "" });
    }
};

// delete project
export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await prisma.project.findUnique({
            where: { id: id }
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check if user is the owner of the project
        if (project.userId !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to delete this project" });
        }

        await prisma.project.delete({
            where: { id: id }
        });

        return res.status(200).json({ message: "Project deleted" });
    } catch (error) {
        logger.error(`deleteProject(): ${error}`);
        return res.status(500).json({ message: "Internal server error", error: "" });
    }
};