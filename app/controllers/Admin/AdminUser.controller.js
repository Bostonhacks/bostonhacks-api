import prismaInstance from "../../database/Prisma.js";
import logger from "../../utils/logger.js";
import PrismaError from "../../constants/PrismaError.js";
import Role from "../../constants/Role.js";

const prisma = prismaInstance;

// Get all users with filtering
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      include = "true",
    } = req.query;

    // Build filter object
    const where = {};

    Object.entries(req.query).forEach(([key, value]) => {
      if (key === "page" || key === "limit") return;

      let parsedValue = value;
      if (value === "true") parsedValue = true;
      else if (value === "false") parsedValue = false;
      else if (!isNaN(value)) parsedValue = parseFloat(value);

      where[key] = parsedValue;
    });

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get users with filters
    const users = await prisma.user.findMany({
      where,
      skip,
      take,
      include: {
        projects: include === 'true',
        applications: include === 'true',
        judge: include === 'true'
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    logger.info(`Admin retrieved ${users.length} users with filters: ${JSON.stringify(where)}`);

    return res.status(200).json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    logger.error('Error getting all users:', err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Get specific user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { include } = req.query;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        projects: include === 'true',
        applications: include === 'true',
        judge: include === 'true'
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    logger.info(`Admin retrieved user with id ${id}`);
    return res.status(200).json(user);
  } catch (err) {
    logger.error('Error getting user by ID:', err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Create new user
export const createUser = async (req, res) => {
  try {
    const userData = req.body;

    const user = await prisma.user.create({
      data: userData,
      userRole: Role.ADMIN,
    });

    logger.info(`Admin created user with id ${user.id}`);
    return res.status(201).json({
      message: "User created successfully",
      user
    });
  } catch (err) {
    logger.error('Error creating user:', err);

    if (err.code === PrismaError.UniqueConstraintFailed) {
      return res.status(400).json({
        message: "User with this email already exists"
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove id from update data if present
    delete updateData.id;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      userRole: Role.ADMIN,
    });

    logger.info(`Admin updated user with id ${id}`);
    return res.status(200).json({
      message: "User updated successfully",
      user
    });
  } catch (err) {
    logger.error('Error updating user:', err);

    if (err.code === PrismaError.RecordsNotFound) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (err.code === PrismaError.UniqueConstraintFailed) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id }
    });

    logger.info(`Admin deleted user with id ${id}`);
    return res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (err) {
    logger.error('Error deleting user:', err);

    if (err.code === PrismaError.RecordsNotFound) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};
