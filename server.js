import app from "./app.js"
import prisma from "./app/database/Prisma.js";

// separate start routine. To find express app, go to app.js

const startServer = async () => {
  try {
    // check if environment file is fully configured
    if (!process.env.PORT || !process.env.NODE_ENV || !process.env.DATABASE_URL) {
      throw new Error('Environment file not fully configured');
    }

    // start server
    const server = app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT} with ${process.env.NODE_ENV} environment`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server')
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();

