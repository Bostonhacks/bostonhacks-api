import express from "express";
import TestRoutes from "./app/routes/Test.routes.js";
import path from "path";
import dotenv from "dotenv";

// database connection
import prisma from "./app/database/Prisma.js";

// set correct config file
dotenv.config({ path: path.join(path.resolve(), `.env.${process.env.NODE_ENV}`)}); 

// express app
const app = express();

app.use(express.json());

/* Routes */
app.use("/test", TestRoutes);


// app.listen(process.env.PORT, () => {
//   console.log(`Server is running on port ${process.env.PORT}`);
// }).catch(async(e) => {

// }).finally(async() => {
//   await prisma.$disconnect();
// });

app.use("/test", TestRoutes);

const startServer = async () => {
  try {
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