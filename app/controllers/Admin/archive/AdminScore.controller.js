import prismaInstance from "../../database/Prisma.js";
import logger from "../../utils/logger.js";

const prisma = prismaInstance;

// Get all scores with filtering
export const getAllScores = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      judgeId,
      projectId,
      minTotalScore,
      maxTotalScore,
      include
    } = req.query;

    // Build filter object
    const where = {};

    if (judgeId) {
      where.judgeId = judgeId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (minTotalScore || maxTotalScore) {
      where.totalScore = {};
      if (minTotalScore) {
        where.totalScore.gte = parseFloat(minTotalScore);
      }
      if (maxTotalScore) {
        where.totalScore.lte = parseFloat(maxTotalScore);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get scores with filters
    const scores = await prisma.score.findMany({
      where,
      skip,
      take,
      include: {
        judge: include === 'true' ? {
          include: {
            user: true
          }
        } : false,
        project: include === 'true'
      },
      orderBy: {
        totalScore: 'desc'
      }
    });

    // Get total count for pagination
    const total = await prisma.score.count({ where });

    logger.info(`Admin retrieved ${scores.length} scores with filters: ${JSON.stringify(where)}`);

    return res.status(200).json({
      scores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    logger.error('Error getting all scores:', err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Get specific score by ID
export const getScoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const { include } = req.query;

    const score = await prisma.score.findUnique({
      where: { id },
      include: {
        judge: include === 'true' ? {
          include: {
            user: true
          }
        } : false,
        project: include === 'true'
      }
    });

    if (!score) {
      return res.status(404).json({
        message: "Score not found"
      });
    }

    logger.info(`Admin retrieved score with id ${id}`);
    return res.status(200).json(score);
  } catch (err) {
    logger.error('Error getting score by ID:', err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Create new score
export const createScore = async (req, res) => {
  try {
    const scoreData = req.body;

    const score = await prisma.score.create({
      data: scoreData,
      include: {
        judge: {
          include: {
            user: true
          }
        },
        project: true
      }
    });

    logger.info(`Admin created score with id ${score.id}`);
    return res.status(201).json({
      message: "Score created successfully",
      score
    });
  } catch (err) {
    logger.error('Error creating score:', err);

    if (err.code === 'P2002') {
      return res.status(400).json({
        message: "Score for this judge-project combination already exists"
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Update score
export const updateScore = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove id from update data if present
    delete updateData.id;

    const score = await prisma.score.update({
      where: { id },
      data: updateData,
      include: {
        judge: {
          include: {
            user: true
          }
        },
        project: true
      }
    });

    logger.info(`Admin updated score with id ${id}`);
    return res.status(200).json({
      message: "Score updated successfully",
      score
    });
  } catch (err) {
    logger.error('Error updating score:', err);

    if (err.code === 'P2025') {
      return res.status(404).json({
        message: "Score not found"
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

// Delete score
export const deleteScore = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.score.delete({
      where: { id }
    });

    logger.info(`Admin deleted score with id ${id}`);
    return res.status(200).json({
      message: "Score deleted successfully"
    });
  } catch (err) {
    logger.error('Error deleting score:', err);

    if (err.code === 'P2025') {
      return res.status(404).json({
        message: "Score not found"
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};
