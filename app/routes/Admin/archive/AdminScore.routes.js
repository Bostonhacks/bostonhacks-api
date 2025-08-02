import express from "express";
import {
    getAllScores,
    getScoreById,
    createScore,
    updateScore,
    deleteScore
} from "../../controllers/Admin/AdminScore.controller.js";

const router = express.Router();

router.get("/", getAllScores);
router.get("/:id", getScoreById);
router.post("/", createScore);
router.put("/:id", updateScore);
router.delete("/:id", deleteScore);

export default router;