import express from "express";
import TestRoutes from "./app/routes/Test.routes.js";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
// import session from "express-session";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerDefinition from "./app/config/swaggerconfig.js";
import logger from "./app/utils/logger.js"



// routers
import UserRoutes from "./app/routes/User.routes.js";
import AuthRoutes from "./app/routes/Auth.routes.js";
import ApplicationRoutes from "./app/routes/Application.routes.js";
import ProjectRoutes from "./app/routes/Project.routes.js";
import JudgingRoutes from "./app/routes/Judging.routes.js";
import AdminRoutes from "./app/routes/Admin/Admin.routes.js";

// set correct config file
if (!process.env.NODE_ENV) {
  logger.warn("No NODE_ENV set. Defaulting to development")
  process.env.NODE_ENV = 'development';
}
dotenv.config({ path: path.join(path.resolve(), `.env.${process.env.NODE_ENV}`) });

// express app
const app = express();

const devOrigins = [
  "http://localhost:3000",
  "http://localhost:8000",
  "http://127.0.0.1:3000"
];
const prodOrigins = [
  "https://bostonhacks.org",
  "https://admin.bostonhacks.org",
  "https://judging.bostonhacks.org",
  "https://www.bostonhacks.org",
  process.env.LOCAL_DEV === "true" ? "http://localhost:3000" : null
]

// middlewares
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? prodOrigins.filter(Boolean) // filter out any null values
    : devOrigins,
  credentials: true
}));
app.use(cookieParser());

// console.log(prodOrigins.filter(Boolean));
// app.use(session({
//   secret: process.env.JWT_SECRET,
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production', // set to true if using https
//     httpOnly: true,
//     sameSite: process.env.NODE_ENV === "production" ? 'strict' : "lax",
//     maxAge: 1000 * 60 * 5 // 5 minute
//   }
// }))


/* Routes */
app.use("/test", TestRoutes);
app.use("/user", UserRoutes);
app.use("/auth", AuthRoutes);
app.use("/application", ApplicationRoutes)
app.use("/project", ProjectRoutes);
app.use("/judging", JudgingRoutes);
app.use("/admin", AdminRoutes);

// expose public folder
// app.use(express.static(path.join(path.resolve(), 'public')));

// expose swagger docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerJsdoc({
  swaggerDefinition,
  apis: [
    "./app/routes/*.js",
    "./app/routes/Admin/*.js", // include admin routes for swagger
  ],
})))

app.get("/", (req, res) => {
  res.redirect("/docs");
});

// keep this last. this is redirects due to 404
app.get("*", (req, res) => {
  res.status(404).json({
    error: "Route not found"
  })
});

export default app
