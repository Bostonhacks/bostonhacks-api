import express from "express";
import {
    getAllJudgingCriteria,
    getJudgingCriteriaById,
    createJudgingCriteria,
    updateJudgingCriteria,
    deleteJudgingCriteria
} from "../../controllers/Admin/AdminJudgingCriteria.controller.js";

const router = express.Router();

router.get("/", getAllJudgingCriteria);
router.get("/:id", getJudgingCriteriaById);
router.post("/", createJudgingCriteria);
router.put("/:id", updateJudgingCriteria);
router.delete("/:id", deleteJudgingCriteria);

export default router;