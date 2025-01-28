import express from "express";
import TestRoutes from "./app/routes/Test.routes.js";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// database connection
import prisma from "./app/database/Prisma.js";

// routers
import UserRoutes from "./app/routes/User.routes.js";
import AuthRoutes from "./app/routes/Auth.routes.js";

// set correct config file
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}
dotenv.config({ path: path.join(path.resolve(), `.env.${process.env.NODE_ENV}`)}); 

// express app
const app = express();

// middlewares
app.use(express.json());
app.use(cors());
app.use(cookieParser());



/* Routes */
app.use("/test", TestRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/auth", AuthRoutes);

// expose public folder
app.use(express.static(path.join(path.resolve(), 'public')));



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