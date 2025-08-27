import prismaInstance from "../database/Prisma.js";
import logger from "../utils/logger.js";

const prisma = prismaInstance;


export const getUser = async (req, res) => {
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

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: req.query.id || '' },
          { email: req.query.email || '' }
        ]
      },
      include: {
        projects: req.query.include ? true : false,
        applications: req.query.include ? true : false,
      },

    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }


    logger.info(`User with id ${req.query.id} retrieved`)
    return res.status(200).json(user);


  } catch (err) {
    logger.error(err);
    res.status(500).json({
      message: "Something went wrong",
      error: err
    });
  }
}

export const getSelf = async (req, res) => {
  try {
    // finds user based on token info instead of query
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id
      },
      select: {
        id: true,
        email: true
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // logger.info(`User with id ${req.user.id} retrieved`)
    return res.status(200).json(user);

  } catch (err) {
    logger.error(err);
    res.status(500).json({
      message: "Something went wrong",
      error: err
    });
  }
}

export const updateUser = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({
        message: "id param is required"
      });
    }

    if (req.user.id !== req.params.id) {
      logger.warn(`Attempted unauthorized update to user with id ${req.params.id}`);
      return res.status(403).json({
        message: "You are not authorized to update this resource"
      });
    }

    const { firstName, lastName } = req.body;

    const updatedUser = await prisma.user.update({
      where: {
        id: req.params.id
      },
      data: {
        firstName,
        lastName
      }
    });

    return res.status(200).json(updatedUser);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        message: "Invalid request data",
        error: err.errors
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: err
    });
  }
}
