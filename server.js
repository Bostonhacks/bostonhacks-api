import app from "./app.js"
import prisma from "./app/database/Prisma.js";
import logger from "./app/utils/logger.js";

// separate start routine. To find express app, go to app.js

const startServer = async () => {
  try {
    // check if environment file is fully configured
    if (!process.env.PORT || !process.env.NODE_ENV || !process.env.DATABASE_URL) {
      throw new Error('Environment file not fully configured');
    }

    // check DB connection
    try {
      await prisma.$connect();
      logger.info('Successfully connected to database');
    } catch (error) {
      throw new Error(`Failed to connect to database: ${error.message}`);
    }

    // start server
    const server = app.listen(process.env.PORT, () => {
      logger.info(`Server is running on port ${process.env.PORT} with ${process.env.NODE_ENV} environment`);
    });




    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.warn('SIGTERM signal received: closing HTTP server')
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();

