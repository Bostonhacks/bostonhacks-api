import express from "express";

import { createJudgingCriteria } from "../../controllers/Admin/AdminJudging.controller.js";

const router = express.Router();

/**
 * 
 */
router.post("/criteria", createJudgingCriteria);


export default router;

