import prismaInstance from "../../database/Prisma.js";
import logger from "../../utils/logger.js";

const prisma = prismaInstance;

// Get all judges with filtering
export const getAllJudges = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      userId,
      year,
      tracks,
      include
    } = req.query;

    // Build filter object
    const where = {};

    if (userId) {
      where.userId = userId;
    }

    if (year) {
      where.year = parseInt(year);
    }

    if (tracks) {
      where.tracks = {
        hasSome: tracks.split(',').map(track => track.trim())
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get judges with filters
    const judges = await prisma.judge.findMany({
      where,
      skip,
      take,
      include: {
        user: include === 'true',
        scores: include === 'true' ? {
          include: {
            project: true
          }
        } : false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get total count for pagination
    const total = await prisma.judge.count({ where });

    logger.info(`Admin retrieved ${judges.length} judges with filters: ${JSON.stringify(where)}`);

    return res.status(200).json({
      judges,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    logger.error('Error getting all judges:', err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Get specific judge by ID
export const getJudgeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { include } = req.query;

    const judge = await prisma.judge.findUnique({
      where: { id },
      include: {
        user: include === 'true',
        scores: include === 'true' ? {
          include: {
            project: true
          }
        } : false
      }
    });

    if (!judge) {
      return res.status(404).json({
        message: "Judge not found"
      });
    }

    logger.info(`Admin retrieved judge with id ${id}`);
    return res.status(200).json(judge);
  } catch (err) {
    logger.error('Error getting judge by ID:', err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Create new judge
export const createJudge = async (req, res) => {
  try {
    const judgeData = req.body;

    const judge = await prisma.judge.create({
      data: judgeData,
      include: {
        user: true,
        scores: true
      }
    });

    logger.info(`Admin created judge with id ${judge.id}`);
    return res.status(201).json({
      message: "Judge created successfully",
      judge
    });
  } catch (err) {
    logger.error('Error creating judge:', err);

    if (err.code === 'P2002') {
      return res.status(400).json({
        message: "Judge with this user or access code already exists"
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Update judge
export const updateJudge = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove id from update data if present
    delete updateData.id;

    const judge = await prisma.judge.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        scores: true
      }
    });

    logger.info(`Admin updated judge with id ${id}`);
    return res.status(200).json({
      message: "Judge updated successfully",
      judge
    });
  } catch (err) {
    logger.error('Error updating judge:', err);

    if (err.code === 'P2025') {
      return res.status(404).json({
        message: "Judge not found"
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Delete judge
export const deleteJudge = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.judge.delete({
      where: { id }
    });

    logger.info(`Admin deleted judge with id ${id}`);
    return res.status(200).json({
      message: "Judge deleted successfully"
    });
  } catch (err) {
    logger.error('Error deleting judge:', err);

    if (err.code === 'P2025') {
      return res.status(404).json({
        message: "Judge not found"
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
}; 
