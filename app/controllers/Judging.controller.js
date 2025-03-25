
import prismaInstance from '../database/Prisma.js';
import logger from '../utils/logger.js';

const prisma = prismaInstance;

/**
 * Submit a score for a project
 */
export const submitScore = async(req, res) => {
    try {
        const { projectId, scoreData } = req.body;
        if (!projectId || !scoreData) {
            return res.status(400).json({ message: 'projectId and scoreData are required' });
        }
  

  
        // Check if user is a judge
        const judge = await prisma.judge.findUnique({
          where: { userId: req.user.id || ""}
        });
  
        if (!judge) {
          return res.status(403).json({ message: 'You are not authorized to judge projects' });
        }
  
        // Check if project exists
        const project = await prisma.project.findUnique({
          where: { id: projectId || '' }
        });
  
        if (!project) {
          return res.status(404).json({ message: 'Project not found' });
        }
  
        // Get current judging criteria for the project's year
        const judgingCriteria = await prisma.judgingCriteria.findUnique({
          where: {
            year_event: {
              year: project.year,
              event: 'BostonHacks', // Default event 
            }
          }
        });
  
        if (!judgingCriteria) {
          return res.status(404).json({ message: 'Judging criteria not set for this year' });
        }
  
        // Parse criteria list from JSON
        const criteriaList = judgingCriteria.criteriaList;
        logger.debug(JSON.stringify(criteriaList, undefined, 2));
        
        // Validate scoreData against criteria
        const validCriteriaNames = Object.keys(criteriaList);
        const scoreKeys = Object.keys(scoreData);
  
        // Check if all submitted criteria are valid
        const invalidCriteria = scoreKeys.filter(key => !validCriteriaNames.includes(key));
        if (invalidCriteria.length > 0) {
            return res.status(400).json({
                message: 'Invalid scoring criteria',
                invalidCriteria,
                validCriteria: validCriteriaNames
            });
        }
  
        // Check if all required criteria are present
        const missingCriteria = validCriteriaNames.filter(name => !scoreKeys.includes(name));
        if (missingCriteria.length > 0) {
            return res.status(400).json({
                message: 'Missing required scoring criteria',
                missingCriteria,
                requiredCriteria: validCriteriaNames
            });
        }
  
        // Calculate total score using weights
        let totalScore = 0;
        for (const [key, value] of Object.entries(criteriaList)) {
          logger.debug(`Criterion: ${key}, Weight: ${value.weight}, Score: ${scoreData[key]}`);
          const score = scoreData[key];
          if (score < 0 || score > 10) {
            return res.status(400).json({
                message: `Score for ${key} must be between 0 and 10`
            });
          }
          totalScore += (score * value.weight);
        }
  
        // Check if the judge already scored this project
        const existingScore = await prisma.score.findUnique({
          where: {
            judgeId_projectId: {
              judgeId: judge.id,
              projectId: projectId
            }
          }
        });

        logger.debug(JSON.stringify(req.body.scoreData, undefined, 2));
  
        // insert score
        let score;
        if (existingScore) {
          return res.status(400).json({ message: 'Judge has already submitted a score for this project' });
        } else {
          // Create new score
          score = await prisma.score.create({
            data: {
              ...req.body,
              scoreData: scoreData,
              judgeId: judge.id,
              projectId: projectId

            }
          });
        }
  
        return res.status(201).json({ 
          message: 'Score submitted successfully', 
          score,
          totalScore
        });
    } catch (error) {
        logger.error('submitScore(): Error submitting score:', error);

        // if zoderror, return the error message
        if (error.name === "ZodError") {
          return res.status(400).json({
              message: "Validation error",
              error: error.errors
          });
        }
          
        return res.status(500).json({ error: 'An error occurred while submitting score' });
    }
};

/**
 * Update a score for a project
 */
export const updateScore = async(req, res) => {
  try {
    const { scoreData } = req.body;
    const { scoreId } = req.params;
    if (!scoreId || !scoreData) {
        return res.status(400).json({ message: 'scoreId and scoreData are required' });
    }



    // Check if user is a judge
    const judge = await prisma.judge.findUnique({
      where: { userId: req.user.id || ""}
    });

    if (!judge) {
      return res.status(403).json({ message: 'You are not authorized to judge projects' });
    }

    // Check if score exists
    const score = await prisma.score.findUnique({
      where: {
        id: scoreId
      },
      include: {
        project: {
          select: {
            year: true
          }
        }
      }
    });

    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }

    // Get current judging criteria for the project's year
    const judgingCriteria = await prisma.judgingCriteria.findUnique({
      where: {
        year_event: {
          year: score?.project?.year,
          event: 'BostonHacks', // Default event 
        }
      }
    });

    if (!judgingCriteria) {
      return res.status(404).json({ message: 'Judging criteria not set for this year' });
    }

    // Parse criteria list from JSON
    const criteriaList = judgingCriteria.criteriaList;
    logger.debug(JSON.stringify(criteriaList, undefined, 2));
    
    // Validate scoreData against criteria
    const validCriteriaNames = Object.keys(criteriaList);
    const scoreKeys = Object.keys(scoreData);

    // Check if all submitted criteria are valid
    const invalidCriteria = scoreKeys.filter(key => !validCriteriaNames.includes(key));
    if (invalidCriteria.length > 0) {
        return res.status(400).json({
            message: 'Invalid scoring criteria',
            invalidCriteria,
            validCriteria: validCriteriaNames
        });
    }

    // Check if all required criteria are present
    const missingCriteria = validCriteriaNames.filter(name => !scoreKeys.includes(name));
    if (missingCriteria.length > 0) {
        return res.status(400).json({
            message: 'Missing required scoring criteria',
            missingCriteria,
            requiredCriteria: validCriteriaNames
        });
    }

    // Calculate total score using weights
    let totalScore = 0;
    for (const [key, value] of Object.entries(criteriaList)) {
      logger.debug(`Criterion: ${key}, Weight: ${value.weight}, Score: ${scoreData[key]}`);
      const score = scoreData[key];
      if (score < 0 || score > 10) {
        return res.status(400).json({
            message: `Score for ${key} must be between 0 and 10`
        });
      }
      totalScore += (score * value.weight);
    }

    logger.debug(JSON.stringify(req.body.scoreData, undefined, 2));

      // Update existing score
    const updatedScore = await prisma.score.update({
      where: {
        id: score.id
      },
      data: {
        ...req.body,
        scoreData: scoreData,
        totalScore: totalScore
      }
    });

    return res.status(200).json({ 
      message: 'Score updated successfully', 
      updatedScore
    });
} catch (error) {
    logger.error('updateScore(): Error updating score:', error);

    // if zoderror, return the error message
    if (error.name === "ZodError") {
      return res.status(400).json({
          message: "Validation error",
          error: error.errors
      });
    }
      
    return res.status(500).json({ error: 'An error occurred while submitting score' });
}
}

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

        const existingCriteria = await prisma.judgingCriteria.findUnique({
            where: {
                year_event: {
                    year: year,
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
 * Get a judge's existing scores
 */
export const getJudgesScores = async (req, res) => {
  try {
    const { judgeId } = req.query;
    if (!judgeId) {
      return res.status(400).json({ message: 'judgeId query parameter is required' });
    }

    const judge = await prisma.judge.findUnique({
      where: { id: judgeId },
      include: {
        user: {
          select: {
            id: true,
          }
        }
      }
    });

    if (judge?.user?.id !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to view this judge\'s scores' });
    }

    const scores = await prisma.score.findMany({
      where: { judgeId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    return res.status(200).json(scores);
  } catch (error) {
    logger.error('getJudgesScores(): Error fetching judge\'s scores:', error);
    return res.status(500).json({ 
      message: 'An error occurred while fetching judge\'s scores',
      error: error
    });
  }
}
  
/**
 * Get a specific score
 */
export const getScore = async (req, res) => {
  try {
    const scoreId = req.params.scoreId;

    // Check if user is a judge
    const judge = await prisma.judge.findUnique({
      where: { userId: req.user.id }
    });

    if (!judge) {
      return res.status(403).json({ message: 'You are not authorized to judge projects' });
    }

    if (!scoreId) {
      return res.status(400).json({ message: 'scoreId url parameter is required' });
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


export const getAllJudges = async (req, res) => {
  try {
    const { year } = req.query;

    const judges = await prisma.judge.findMany({
      where: {
        year: {
          equals: year ? parseInt(year) : new Date().getFullYear()
        }
      },
      select: {
        id: true,
        tracks: true,
        year: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }

      }

    });

    return res.status(200).json(judges);
  } catch (error) {
    logger.error('getAllJudges(): Error fetching all judges:', error);
    return res.status(500).json({ message: 'An error occurred while fetching judges', error });
  }
}

export const getJudge = async (req, res) => {
  try {
    const { id } = req.params;

    // get judge and include user and scores
    const judge = await prisma.judge.findUnique({
      where: { id: id },
      select: {
        id: true,
        tracks: true,
        year: true,
        scores: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    if (!judge) {
      return res.status(404).json({ message: 'Judge not found' });
    }

    return res.status(200).json(judge);
  } catch (error) {
    logger.error('getJudge(): Error fetching judge:', error);
    return res.status(500).json({ message: 'An error occurred while fetching judge', error });
  }
}