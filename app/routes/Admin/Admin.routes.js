import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import { verifyAdmin } from "../../middleware/admin.js";

// import AdminJudgingRoutes from "./AdminJudging.routes.js"

const router = express.Router();

/* important middleware to verify token, then verify admin
 * this applies to all routes AFTER THIS LINE
 * do not place any routes before this line or they will
 * not be verified.
 */
router.use(verifyToken, verifyAdmin);

// router.use("/judging", AdminJudgingRoutes);


// router.use("/user", AdminUserRoutes);
// router.use("/application", AdminApplicationRoutes)
// router.use("/project", AdminProjectRoutes);

export default router;
