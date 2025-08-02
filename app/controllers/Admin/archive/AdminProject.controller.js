import prismaInstance from "../../database/Prisma.js";
import logger from "../../utils/logger.js";
import PrismaError from "../../constants/PrismaError.js";

const prisma = prismaInstance;

// Get all projects with filtering
export const getAllProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      year,
      track,
      isWinner,
      technologies,
      teamName,
      include
    } = req.query;

    // Build filter object
    const where = {};

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive'
      };
    }

    if (year) {
      where.year = parseInt(year);
    }

    if (track) {
      where.track = {
        contains: track,
        mode: 'insensitive'
      };
    }

    if (isWinner !== undefined) {
      where.isWinner = isWinner === 'true';
    }

    if (technologies) {
      where.technologies = {
        hasSome: technologies.split(',').map(tech => tech.trim())
      };
    }

    if (teamName) {
      where.teamName = {
        contains: teamName,
        mode: 'insensitive'
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get projects with filters
    const projects = await prisma.project.findMany({
      where,
      skip,
      take,
      include: {
        members: include === 'true',
        scores: include === 'true'
      },
      orderBy: {
        year: 'desc'
      }
    });

    // Get total count for pagination
    const total = await prisma.project.count({ where });

    logger.info(`Admin retrieved ${projects.length} projects with filters: ${JSON.stringify(where)}`);

    return res.status(200).json({
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    logger.error('Error getting all projects:', err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Get specific project by ID
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const { include } = req.query;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: include === 'true',
        scores: include === 'true' ? {
          include: {
            judge: {
              include: {
                user: true
              }
            }
          }
        } : false
      }
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    logger.info(`Admin retrieved project with id ${id}`);
    return res.status(200).json(project);
  } catch (err) {
    logger.error('Error getting project by ID:', err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Create new project
export const createProject = async (req, res) => {
  try {
    const projectData = req.body;

    // Handle members if provided as email array
    if (projectData.members && Array.isArray(projectData.members)) {
      const memberEmails = projectData.members;
      const members = await prisma.user.findMany({
        where: {
          email: {
            in: memberEmails
          }
        },
        select: {
          id: true
        }
      });

      projectData.members = {
        connect: members.map(member => ({ id: member.id }))
      };
    }

    const project = await prisma.project.create({
      data: projectData,
      include: {
        members: true,
        scores: true
      }
    });

    logger.info(`Admin created project with id ${project.id}`);
    return res.status(201).json({
      message: "Project created successfully",
      project
    });
  } catch (err) {
    logger.error('Error creating project:', err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove id from update data if present
    delete updateData.id;

    // Handle members update if provided
    if (updateData.members && Array.isArray(updateData.members)) {
      const memberEmails = updateData.members;
      const members = await prisma.user.findMany({
        where: {
          email: {
            in: memberEmails
          }
        },
        select: {
          id: true
        }
      });

      updateData.members = {
        set: members.map(member => ({ id: member.id }))
      };
    }

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        members: true,
        scores: true
      }
    });

    logger.info(`Admin updated project with id ${id}`);
    return res.status(200).json({
      message: "Project updated successfully",
      project
    });
  } catch (err) {
    logger.error('Error updating project:', err);

    if (err.code === PrismaError.RecordsNotFound) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id }
    });

    logger.info(`Admin deleted project with id ${id}`);
    return res.status(200).json({
      message: "Project deleted successfully"
    });
  } catch (err) {
    logger.error('Error deleting project:', err);

    if (err.code === PrismaError.RecordsNotFound) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};
