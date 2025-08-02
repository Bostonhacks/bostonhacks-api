import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import { verifyAdmin } from "../../middleware/admin.js";

// Import all admin route modules
import AdminUserRoutes from "./AdminUser.routes.js";
import AdminApplicationRoutes from "./AdminApplication.routes.js";
// import AdminProjectRoutes from "./AdminProject.routes.js";
// import AdminJudgeRoutes from "./AdminJudge.routes.js";
// import AdminScoreRoutes from "./AdminScore.routes.js";
// import AdminJudgingCriteriaRoutes from "./AdminJudgingCriteria.routes.js";

const router = express.Router();

/* Important middleware to verify token, then verify admin
 * This applies to all routes AFTER THIS LINE
 * Do not place any routes before this line or they will
 * not be verified.
 */
router.use(verifyToken, verifyAdmin);

// Mount all admin route modules
router.use("/user", AdminUserRoutes);
router.use("/application", AdminApplicationRoutes);
// router.use("/project", AdminProjectRoutes);
// router.use("/judge", AdminJudgeRoutes);
// router.use("/score", AdminScoreRoutes);
// router.use("/judging-criteria", AdminJudgingCriteriaRoutes);

export default router;
