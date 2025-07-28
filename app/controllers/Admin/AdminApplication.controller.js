import prismaInstance from "../../database/Prisma.js";
import logger from "../../utils/logger.js";
import PrismaError from "../../constants/PrismaError.js";

const prisma = prismaInstance;

// Get all applications with filtering
export const getAllApplications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      applicationYear,
      userId,
      gender,
      ethnicity,
      gradYear,
      school,
      city,
      state,
      country,
      educationLevel,
      major,
      include
    } = req.query;

    // Build filter object
    const where = {};

    if (status) {
      where.status = status;
    }

    if (applicationYear) {
      where.applicationYear = parseInt(applicationYear);
    }

    if (userId) {
      where.userId = userId;
    }

    if (gender) {
      where.gender = {
        contains: gender,
        mode: 'insensitive'
      };
    }

    if (ethnicity) {
      where.ethnicity = {
        contains: ethnicity,
        mode: 'insensitive'
      };
    }

    if (gradYear) {
      where.gradYear = parseInt(gradYear);
    }

    if (school) {
      where.school = {
        contains: school,
        mode: 'insensitive'
      };
    }

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive'
      };
    }

    if (state) {
      where.state = {
        contains: state,
        mode: 'insensitive'
      };
    }

    if (country) {
      where.country = {
        contains: country,
        mode: 'insensitive'
      };
    }

    if (educationLevel) {
      where.educationLevel = {
        contains: educationLevel,
        mode: 'insensitive'
      };
    }

    if (major) {
      where.major = {
        contains: major,
        mode: 'insensitive'
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get applications with filters
    const applications = await prisma.application.findMany({
      where,
      skip,
      take,
      include: {
        user: include === 'true'
      },
      orderBy: {
        applicationYear: 'desc'
      }
    });

    // Get total count for pagination
    const total = await prisma.application.count({ where });

    logger.info(`Admin retrieved ${applications.length} applications with filters: ${JSON.stringify(where)}`);

    return res.status(200).json({
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    logger.error('Error getting all applications:', err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Get specific application by ID
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { include } = req.query;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: include === 'true'
      }
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    logger.info(`Admin retrieved application with id ${id}`);
    return res.status(200).json(application);
  } catch (err) {
    logger.error('Error getting application by ID:', err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Create new application
export const createApplication = async (req, res) => {
  try {
    const applicationData = req.body;

    const application = await prisma.application.create({
      data: applicationData,
      include: {
        user: true
      }
    });

    logger.info(`Admin created application with id ${application.id}`);
    return res.status(201).json({
      message: "Application created successfully",
      application
    });
  } catch (err) {
    logger.error('Error creating application:', err);

    if (err.code === PrismaError.UniqueConstraintFailed) {
      return res.status(400).json({
        message: "Application with this phone number already exists"
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Update application
export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove id from update data if present
    delete updateData.id;

    const application = await prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        user: true
      }
    });

    logger.info(`Admin updated application with id ${id}`);
    return res.status(200).json({
      message: "Application updated successfully",
      application
    });
  } catch (err) {
    logger.error('Error updating application:', err);

    if (err.code === PrismaError.RecordsNotFound) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Delete application
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.application.delete({
      where: { id }
    });

    logger.info(`Admin deleted application with id ${id}`);
    return res.status(200).json({
      message: "Application deleted successfully"
    });
  } catch (err) {
    logger.error('Error deleting application:', err);

    if (err.code === PrismaError.RecordsNotFound) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};
