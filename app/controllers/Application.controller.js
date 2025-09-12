import prismaInstance from "../database/Prisma.js";
import logger from "../utils/logger.js";
import { uploadFileToAzure, deleteFileFromAzure, generateTemporaryUrl } from "../utils/azureStorage.js";
import { transformApplicationData } from "../utils/formDataTransform.js";
import ApplicationStatus from "../constants/ApplicationStatus.js";

const prisma = prismaInstance;

export const getApplication = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({
        message: "id parameter is required"
      });
    }

    const application = await prisma.application.findUnique({
      where: {
        id: req.params.id,
      }
    });

    // verify logged in user matches requested user
    if (req.user.id !== application?.userId) {
      logger.warn(`Attempted unauthorized access to application with id ${req.params.id}`);
      return res.status(403).json({
        message: "You are not authorized to access this resource"
      });
    }


    logger.info(`Application with id ${req.params.id} retrieved`)

    return res.status(200).json(application);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err
    });
  }
}

export const getUserApplications = async (req, res) => {
  try {
    if (!req.query.user_id) {
      return res.status(400).json({
        message: "user_id field is required"
      });
    }

    // verify logged in user matches requested user
    if (req.user.id !== req.query.user_id) {
      logger.warn(`Attempted unauthorized access to application with id ${req.query.user_id}`);
      logger.debug(`User id: ${req.user.id} | Application id: ${req.params.id}`);

      return res.status(403).json({
        message: "You are not authorized to access this resource"
      });
    }

    const applications = await prisma.application.findMany({
      where: {
        userId: req.query.user_id,
      }
    });
    logger.info(`Applications for user with id ${req.query.user_id} retrieved`)

    return res.status(200).json(applications);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err
    });
  }
}

export const createApplication = async (req, res) => {
  let uploadedFileName = null; // Track uploaded file for potential cleanup

  try {
    const transformedBody = transformApplicationData(req.body);
    const { userId } = transformedBody;

    // Auth validation
    if (!userId) {
      return res.status(400).json({
        message: "userId field is required"
      });
    }
    else if (req.user.id !== userId) {
      logger.warn(`Attempted unauthorized access to create application for user with id ${userId}`);
      return res.status(403).json({
        message: "You are not authorized to access this resource"
      });
    }

    // check if correct year
    if (transformedBody.applicationYear !== new Date().getFullYear()) {
      return res.status(400).json({
        message: "Invalid application year"
      });
    }

    // check if user already has application for current year
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId: userId,
        applicationYear: transformedBody.applicationYear
      }
    });
    if (existingApplication) {
      return res.status(400).json({
        message: "User already has an application for this year"
      });
    }

    const applicationData = {
      ...transformedBody,
      userId: req.user.id,
    };

    // STEP 1: Handle file upload FIRST (if present)
    if (req.file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only PDF, DOC, and DOCX files are allowed"
        });
      }

      const maxSize = 10 * 1024 * 1024;
      if (req.file.size > maxSize) {
        return res.status(400).json({
          message: "File size too large. Maximum size is 10MB"
        });
      }

      // Upload file to Azure FIRST
      const fileExtension = req.file.originalname.split('.').pop();
      const fileName = `resume_${req.user.id}_${Date.now()}.${fileExtension}`;

      try {
        uploadedFileName = await uploadFileToAzure(req.file, fileName);
        applicationData.resumeUrl = uploadedFileName;
        logger.info(`File uploaded successfully: ${uploadedFileName}`);
      } catch (uploadError) {
        logger.error('Error uploading resume during application creation:', uploadError);
        return res.status(500).json({
          message: "Error uploading resume file",
          error: uploadError.message
        });
      }
    }

    // STEP 2: Create application in database
    try {
      const application = await prisma.application.create({
        data: applicationData
      });

      logger.info(`Application with id ${application.id} created by user with id ${req.user.id}${req.file ? ' with resume' : ''}`);

      return res.status(201).json({
        message: "Application created successfully",
        application: application
      });

    } catch (dbError) {
      // ROLLBACK: If database creation fails, delete the uploaded file
      if (uploadedFileName) {
        try {
          await deleteFileFromAzure(uploadedFileName);
          logger.info(`Cleaned up uploaded file after database error: ${uploadedFileName}`);
        } catch (cleanupError) {
          logger.error('Failed to cleanup uploaded file after database error:', cleanupError);
        }
      }

      // Re-throw the database error
      throw dbError;
    }

  } catch (err) {
    logger.error('Error in createApplication:', err);

    // EMERGENCY CLEANUP: If we have an uploaded file and hit an unexpected error
    if (uploadedFileName) {
      try {
        await deleteFileFromAzure(uploadedFileName);
        logger.info(`Emergency cleanup of uploaded file: ${uploadedFileName}`);
      } catch (cleanupError) {
        logger.error('Failed emergency cleanup of uploaded file:', cleanupError);
      }
    }

    // if zoderror, return the error message
    if (err.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        error: err.errors
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: err
    });
  }
};

export const updateApplication = async (req, res) => {
  let newUploadedFileName = null;
  let oldFileName = null;

  try {
    if (!req.params.id) {
      return res.status(400).json({
        message: "id parameter is required"
      });
    }

    // have to check for status field since status can be updated only on certain conditions 
    if (req.body.status) {
      return res.status(400).json({
        message: "Status field cannot be updated via this endpoint"
      });
    }

    const application = await prisma.application.findUnique({
      where: {
        id: req.params.id,
      }
    });

    // verify logged in user matches requested user
    if (req.user.id !== application?.userId) {
      logger.warn(`Attempted unauthorized access to application with id ${req.params.id}`);
      return res.status(403).json({
        message: "You are not authorized to access this resource"
      });
    }

    const updateData = transformApplicationData(req.body);

    // Store old file name for potential cleanup
    oldFileName = application.resumeUrl;

    // STEP 1: Handle file upload FIRST (if present)
    if (req.file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only PDF, DOC, and DOCX files are allowed"
        });
      }

      const maxSize = 10 * 1024 * 1024;
      if (req.file.size > maxSize) {
        return res.status(400).json({
          message: "File size too large. Maximum size is 10MB"
        });
      }

      // Upload new file
      const fileExtension = req.file.originalname.split('.').pop();
      const fileName = `resume_${application.userId}_${application.id}_${Date.now()}.${fileExtension}`;

      try {
        newUploadedFileName = await uploadFileToAzure(req.file, fileName);
        updateData.resumeUrl = newUploadedFileName;
        logger.info(`New file uploaded: ${newUploadedFileName}`);
      } catch (uploadError) {
        logger.error('Error uploading resume during application update:', uploadError);
        return res.status(500).json({
          message: "Error uploading resume file",
          error: uploadError.message
        });
      }
    }

    // STEP 2: Update database
    try {
      const updatedApplication = await prisma.application.update({
        where: {
          id: req.params.id
        },
        data: updateData
      });

      // STEP 3: Delete old file only AFTER successful database update
      if (newUploadedFileName && oldFileName) {
        try {
          await deleteFileFromAzure(oldFileName);
          logger.info(`Deleted old file: ${oldFileName}`);
        } catch (deleteError) {
          logger.warn('Failed to delete old file (non-critical):', deleteError);
          // Don't fail the request - the update was successful
        }
      }

      logger.info(`Application with id ${req.params.id} updated${req.file ? ' with new resume' : ''}`);
      res.status(200).json({
        message: "Application updated successfully",
        application: updatedApplication
      });

    } catch (dbError) {
      // ROLLBACK: Delete newly uploaded file if database update fails
      if (newUploadedFileName) {
        try {
          await deleteFileFromAzure(newUploadedFileName);
          logger.info(`Cleaned up new file after database error: ${newUploadedFileName}`);
        } catch (cleanupError) {
          logger.error('Failed to cleanup new file after database error:', cleanupError);
        }
      }

      throw dbError;
    }

  } catch (err) {
    logger.error('Error in updateApplication:', err);

    // EMERGENCY CLEANUP
    if (newUploadedFileName) {
      try {
        await deleteFileFromAzure(newUploadedFileName);
        logger.info(`Emergency cleanup of new file: ${newUploadedFileName}`);
      } catch (cleanupError) {
        logger.error('Failed emergency cleanup:', cleanupError);
      }
    }

    // if zoderror, return the error message
    if (err.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        error: err.errors
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: err
    });
  }
};

export const uploadResume = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({
        message: "Application id parameter is required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Resume file is required"
      });
    }

    // Get the application to verify ownership
    const application = await prisma.application.findUnique({
      where: {
        id: req.params.id,
      }
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    // verify logged in user matches requested user
    if (req.user.id !== application.userId) {
      logger.warn(`Attempted unauthorized access to upload resume for application ${req.params.id}`);
      return res.status(403).json({
        message: "You are not authorized to access this resource"
      });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Invalid file type. Only PDF, DOC, and DOCX files are allowed"
      });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({
        message: "File size too large. Maximum size is 10MB"
      });
    }

    // Generate unique filename
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `resume_${application.userId}_${application.id}_${Date.now()}.${fileExtension}`;

    // Delete old resume if exists
    if (application.resumeUrl) {
      try {
        const oldFileName = application.resumeUrl.split('/').pop();
        await deleteFileFromAzure(oldFileName);
      } catch (error) {
        logger.warn('Failed to delete old resume file:', error);
        // Continue with upload even if deletion fails
      }
    }

    // Upload to Azure
    const resumeUrl = await uploadFileToAzure(req.file, fileName);

    // Update application with resume URL
    const updatedApplication = await prisma.application.update({
      where: {
        id: req.params.id
      },
      data: {
        resumeUrl: resumeUrl
      }
    });

    logger.info(`Resume uploaded for application ${req.params.id}`);

    return res.status(200).json({
      message: "Resume uploaded successfully",
      resumeUrl: resumeUrl,
      application: updatedApplication
    });
  } catch (error) {
    logger.error('Error uploading resume:', error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

export const deleteResume = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({
        message: "Application id parameter is required"
      });
    }

    const application = await prisma.application.findUnique({
      where: {
        id: req.params.id,
      }
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    // verify logged in user matches requested user
    if (req.user.id !== application.userId) {
      logger.warn(`Attempted unauthorized access to delete resume for application ${req.params.id}`);
      return res.status(403).json({
        message: "You are not authorized to access this resource"
      });
    }

    if (!application.resumeUrl) {
      return res.status(404).json({
        message: "No resume found for this application"
      });
    }

    // Delete from Azure
    const fileName = application.resumeUrl.split('/').pop();
    await deleteFileFromAzure(fileName);

    // Update application to remove resume URL
    const updatedApplication = await prisma.application.update({
      where: {
        id: req.params.id
      },
      data: {
        resumeUrl: null
      }
    });

    logger.info(`Resume deleted for application ${req.params.id}`);

    return res.status(200).json({
      message: "Resume deleted successfully",
      application: updatedApplication
    });
  } catch (error) {
    logger.error('Error deleting resume:', error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

export const getResumeUrl = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({
        message: "Application id parameter is required"
      });
    }

    const application = await prisma.application.findUnique({
      where: {
        id: req.params.id,
      }
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    // Authorization check - user can only access their own resume, or admins can access any
    if (req.user.id !== application.userId && req.user.role !== 'ADMIN') {
      logger.warn(`Attempted unauthorized access to resume for application ${req.params.id}`);
      return res.status(403).json({
        message: "You are not authorized to access this resource"
      });
    }

    if (!application.resumeUrl) {
      return res.status(404).json({
        message: "No resume found for this application"
      });
    }

    // Generate temporary URL (expires in 15 minutes)
    const temporaryUrlData = await generateTemporaryUrl(application.resumeUrl, 15);

    logger.info(`Temporary resume URL generated for application ${req.params.id}`);

    return res.status(200).json({
      message: "Temporary URL generated successfully",
      resumeUrl: temporaryUrlData.url,
      expiresAt: temporaryUrlData.expiresAt,
      expiresInMinutes: temporaryUrlData.expiresInMinutes,
      notice: "This URL will expire and become inaccessible after the specified time"
    });
  } catch (error) {
    logger.error('Error generating temporary resume URL:', error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

export const confirmOrDenyApplication = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({
        message: "Application id parameter is required"
      });
    }

    const { status } = req.body;

    if (!status || ![ApplicationStatus.CONFIRMED, ApplicationStatus.DECLINED].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Allowed values are 'CONFIRMED' or 'DECLINED'."
      });
    }

    const application = await prisma.application.findUnique({
      where: {
        id: req.params.id,
      }
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    // Authorization check - only the user who owns the application can update it
    if (req.user.id !== application.userId) {
      logger.warn(`Unauthorized attempt to update application status for id ${req.params.id}`);
      return res.status(403).json({
        message: "You are not authorized to update this application."
      });
    }


    // Verify current status is "ACCEPTED"
    if (application.status !== ApplicationStatus.ACCEPTED) {
      return res.status(400).json({
        message: "Application status must be 'ACCEPTED' to update to 'CONFIRMED' or 'DECLINED'."
      });
    }

    const updatedApplication = await prisma.application.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: status,
      }
    });

    logger.info(`Application status updated to '${status}' for application id ${req.params.id}`);
    return res.status(200).json({
      message: `Application status updated to '${status}' successfully.`,
      application: updatedApplication,
    });
  } catch (error) {
    logger.error('Error in confirmOrDenyApplication:', error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }

}
