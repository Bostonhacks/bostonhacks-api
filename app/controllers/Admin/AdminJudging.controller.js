
import prismaInstance from '../../database/Prisma.js';
import logger from '../../utils/logger.js';

const prisma = prismaInstance;


/**
 * Get projects to be judged by the current judge
 */
export const getProjectsToJudge = async (req, res) => {
    try {
        const { year } = req.query;
        
        // Check if user is a judge
        const judge = await prisma.judge.findUnique({
            where: { userId: req.user.id },
            include: { scores: true }
        });

        if (!judge) {
            return res.status(403).json({ error: 'You are not authorized to judge projects' });
        }

        // Get projects for the specified tracks (if any)
        if (judge.tracks && judge.tracks.length > 0) {
            // ignore for now
        }

        const projects = await prisma.project.findMany({
            where: {
              year: year ? parseInt(year) : new Date().getFullYear()
            },
            include: {
                members: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                scores: {
                    where: {
                        judgeId: judge.id
                    }
                }
            }
        });

        // Mark projects that have already been scored
        const projectsWithScoringStatus = projects.map(project => {
            const scored = project.scores.length > 0;
            return {
              ...project,
              scored,
              // Remove actual scores to keep response clean
              scores: undefined
            };
        });

        return res.status(200).json(projectsWithScoringStatus);
    } catch (error) {
        logger.error('getProjectsToJudge(): Error fetching projects to judge:', error);
        return res.status(500).json({ 
            message: 'An error occurred while fetching projects to judge',
            error: error
        });
    }
};
  
  /**
   * Get the current judging criteria for a specific year
   */
export const getJudgingCriteria = async (req, res) => {
    try {
        const { year } = req.query;
        const currentYear = year ? parseInt(year) : new Date().getFullYear();

        const judgingCriteria = await prisma.judgingCriteria.findUnique({
          where: {
            year_event: {
              year: currentYear,
              event: 'BostonHacks'
            }
          }
        });

        if (!judgingCriteria) {
          return res.status(404).json({ error: 'Judging criteria not found for this year' });
        }

        return res.status(200).json(judgingCriteria);
    } catch (error) {
        logger.error('getJudgingCriteria(): Error fetching judging criteria:', error);
        return res.status(500).json({ 
          message: "An error occurred while fetching judging criteria",
          error: error
        });
    }
};

/**
 * Admin route to create judging criteria for a specific year
 */
export const createJudgingCriteria = async (req, res) => {
  try {
      const { year, criteriaList } = req.body;
      let { event } = req.body;

      if (!event) {
          event = 'BostonHacks'; // Default event
      }

      if (!year || !criteriaList) {
          return res.status(400).json({ message: 'year and criteriaList are required' });
      }

      // check if criteriaList is an object {}
      if (typeof criteriaList !== "object" || Array.isArray(criteriaList) || criteriaList === null || Object.keys(criteriaList).length === 0) {
          return res.status(400).json({ message: 'criteriaList must be an object' });
      }

      const existingCriteria = await prisma.judgingCriteria.findUnique({
          where: {
              year_event: {
                  year: year || new Date().getFullYear(),
                  event: event
              }
          }
      });

      if (existingCriteria) {
          return res.status(400).json({ message: 'Judging criteria for this year already exists' });
      }

      const newCriteria = await prisma.judgingCriteria.create({
          data: {
              year: year,
              event: event,
              criteriaList: criteriaList
          }
      });

      return res.status(201).json(newCriteria);
  } catch (error) {
      logger.error('createJudgingCriteria(): Error creating judging criteria:', error);
      return res.status(500).json({ 
        message: "An error occurred while creating judging criteria",
        error: error
      });
  }
}
  
/**
 * Get a judge's existing score for a project
 */
export const getScore = async (req, res) => {
  // try {
  //   const { projectId } = req.params;

  //   // Check if user is a judge
  //   const judge = await prisma.judge.findUnique({
  //     where: { userId: req.user.id }
  //   });

  //   if (!judge) {
  //     return res.status(403).json({ message: 'You are not authorized to judge projects' });
  //   }

  //   // Get the score if it exists
  //   const score = await prisma.score.findUnique({
  //     where: {
  //       judgeId_projectId: {
  //         judgeId: judge.id,
  //         projectId
  //       }
  //     }
  //   });

  //   if (!score) {
  //     return res.status(404).json({ message: 'Score not found' });
  //   }

  //   return res.status(200).json(score);
  // } catch (error) {
  //   console.error('getProjectScore(): Error fetching project score:', error);
  //   return res.status(500).json({ 
  //     message: 'An error occurred while fetching project score',
  //     error: error
  //   });
  // }
  try {
    const { scoreId } = req.params;

    // Check if user is a judge
    const judge = await prisma.judge.findUnique({
      where: { userId: req.user.id }
    });

    if (!judge) {
      return res.status(403).json({ message: 'You are not authorized to judge projects' });
    }

    if (!scoreId) {
      const scores = await prisma.score.findMany({
        where: {
          judgeId: judge.id
        }
      });
      return res.status(200).json(scores);
    }
    // Get the score if it exists
    const score = await prisma.score.findUnique({
      where: {
        id: scoreId
      }
    });

    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }

    return res.status(200).json(score);
  } catch(error) {
    logger.error('getScore(): Error fetching project score:', error);
    return res.status(500).json({ 
      message: 'An error occurred while fetching project score',
      error: error
    });
  }
};
  
/**
 * Get all scores for a project (admin only)
 */
export const getAllProjectScores = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Only admins can see all scores
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view all scores' });
    }

    const scores = await prisma.score.findMany({
      where: { projectId },
      include: {
        judge: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      }
    });

    // Calculate average score
    let totalScore = 0;
    scores.forEach(score => {
      totalScore += score.totalScore;
    });
    const averageScore = scores.length > 0 ? totalScore / scores.length : 0;

    return res.status(200).json({
      scores,
      averageScore,
      numberOfJudges: scores.length
    });
  } catch (error) {
    console.error('Error fetching all project scores:', error);
    return res.status(500).json({ error: 'An error occurred while fetching scores' });
  }
};

export const createJudge = async (req, res) => {
    try {
  
        if (req.user.role !== "ADMIN") {
          return res.status(403).json({ message: "You are not authorized to create a judge" });
        }
        

        // generate random alphanumeric access code
        const accessCode = Math.random().toString(36).substring(2, 10);

        // if a userId is provided (meaning we want to automatically assign a judge)
        if (req.body.userId) {
          // Create judge with provided userId
          const judge = await prisma.judge.create({
              data: {
                  accessCode: accessCode,
                  tracks: req.body.tracks || ["all"],
                  user: {
                      connect: { id: req.body.userId }
                  }
              },
              include: {
                  user: {
                      select: {
                          id: true,
                          email: true,
                          firstName: true,
                          lastName: true
                      }
                  }
              },
              userRole: req.user.role || "USER"
          });
          
          return res.status(201).json({
              message: "Judge created successfully",
              judge
          });
      } else {
          // if want to create judge object but dont attach a user yet
          // Create a placeholder user since userId is required
          // Generate a unique email for this placeholder user
          const placeholderEmail = `judge-${accessCode}@placeholder.bostonhacks.org`;
          console.log(placeholderEmail, accessCode);
          
          // Create both user and judge at once
          const judge = await prisma.judge.create({
              data: {
                  accessCode: accessCode,
                  tracks: req.body.tracks || ["all"],
                  user: {
                      create: {
                          email: placeholderEmail,
                          firstName: "Judge",
                          lastName: accessCode.toUpperCase(),
                          role: "USER",
                          password: accessCode, // keep this as is
                      }
                  }
              },
              include: {
                  user: {
                      select: {
                          id: true,
                          email: true,
                          firstName: true,
                          lastName: true
                      }
                  }
              },
              userRole: req.user.role || "USER"
          });
          
          return res.status(201).json({
              message: "Judge created successfully with placeholder user",
              judge,
              accessCode: accessCode // Include access code in response
          });
      }

    } catch (error) {
        logger.error('createJudge(): Error creating judge:', error);
        return res.status(500).json({ message: 'An error occurred while creating judge', error });
    }
};

export const attachJudgeToUser = async (req, res) => {
    try {
        // check for access_code that is automatically generated on judge creation
        const { access_code, userId } = req.body;


        if (!access_code || !userId) {
            return res.status(400).json({ message: 'access_code and userId are required' });
        }

        // check if user is correct
        if (req.user.id !== userId) {
            logger.warn(`Attempted unauthorized access to attach judge to user with id ${userId}`);
            return res.status(403).json({
                message: "You are not authorized to access this resource"
            });
        }

        const currentJudge = await prisma.judge.findUnique({
            where: { accessCode: access_code },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        password: true
                    }
                }
            }
        });
        if (!currentJudge) {
            return res.status(404).json({ message: 'Judge not found' });
        }

        // to prevent accidental real account deletion, check if the user is a placeholder
        let tempUser = null;
        if (currentJudge?.user?.password === access_code) {
            tempUser = currentJudge.user;
        }
          


        // Attach the judge to the user
        // eslint-disable-next-line no-unused-vars
        const result = await prisma.$transaction(async (tx) => {
          // 1. First update the judge to point to the new user
          const updatedJudge = await tx.judge.update({
              where: { id: currentJudge.id },
              data: {
                  user: {
                      connect: { id: userId }
                  }
              },
              include: {
                  user: {
                      select: {
                          id: true,
                          firstName: true,
                          lastName: true,
                          email: true
                      }
                  }
              }
          });

          // 2. Then delete the temporary user now that the judge is no longer referencing it
          if (tempUser) {
              await tx.user.delete({
                  where: { id: tempUser.id }
              }).catch(error => {
                  // If deleting fails (e.g., user doesn't exist or is referenced elsewhere),
                  // just log it but don't fail the transaction
                  logger.error(`Couldn't delete temp user: ${error.message}`);
              });
          }

          return {
              message: "Judge attached to user successfully",
              judge: updatedJudge
          };
        });

        return res.status(200).json(result);

    } catch (error) {
        logger.error('attachJudgeToUser(): Error attaching judge to user:', error);
        return res.status(500).json({ message: 'An error occurred while attaching judge to user. Possible that the current user is already attached to a Judge', error });
    }
}