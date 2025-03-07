
import prismaInstance from '../database/Prisma.js';
import logger from '../utils/logger.js';

const prisma = prismaInstance;

/**
 * Submit a score for a project
 */
export const submitScore = async(req, res) => {
    try {
        const { projectId, scoreData } = req.body;
  

  
        // Check if user is a judge
        const judge = await prisma.judge.findUnique({
          where: { userId: req.user.id }
        });
  
        if (!judge) {
          return res.status(403).json({ message: 'You are not authorized to judge projects' });
        }
  
        // Check if project exists
        const project = await prisma.project.findUnique({
          where: { id: projectId }
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
        
        // Validate scoreData against criteria
        const validCriteriaNames = criteriaList.criteria.map(c => c.name);
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
        criteriaList.criteria.forEach(criterion => {
          const score = scoreData[criterion.name];
          totalScore += (score * criterion.weight);
        });
  
        // Check if the judge already scored this project
        const existingScore = await prisma.score.findUnique({
          where: {
            judgeId_projectId: {
              judgeId: judge.id,
              projectId: projectId
            }
          }
        });
  
        let score;
        if (existingScore) {
          // Update existing score
          score = await prisma.score.update({
            where: {
              id: existingScore.id
            },
            data: {
              ...req.body,
            }
          });
        } else {
          // Create new score
          score = await prisma.score.create({
            data: {
              ...req.body,
              judgeId: judge.id,
              projectId: projectId,

            }
          });
        }
  
        return res.status(200).json({ 
          message: 'Score submitted successfully', 
          score,
          totalScore
        });
    } catch (error) {
        logger.error('submitScore(): Error submitting score:', error);

        // if zoderror, return the error message
        if (err.name === "ZodError") {
          return res.status(400).json({
              message: "Validation error",
              error: err.errors
          });
        }
          
        return res.status(500).json({ error: 'An error occurred while submitting score' });
    }
};

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
        const whereClause = {
            year: year ? parseInt(year) : new Date().getFullYear()
        };

        if (judge.tracks && judge.tracks.length > 0) {
            whereClause.track = { in: judge.tracks };
        }

        const projects = await prisma.project.findMany({
            where: whereClause,
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
 * Get a judge's existing score for a project
 */
export const getProjectScore = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if user is a judge
    const judge = await prisma.judge.findUnique({
      where: { userId: req.user.id }
    });

    if (!judge) {
      return res.status(403).json({ message: 'You are not authorized to judge projects' });
    }

    // Get the score if it exists
    const score = await prisma.score.findUnique({
      where: {
        judgeId_projectId: {
          judgeId: judge.id,
          projectId
        }
      }
    });

    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }

    return res.status(200).json(score);
  } catch (error) {
    console.error('getProjectScore(): Error fetching project score:', error);
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