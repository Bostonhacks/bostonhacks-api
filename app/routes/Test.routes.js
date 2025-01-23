import express from "express"
import { getTest } from "../controllers/Test.controller.js";

const router = express.Router();


router.get("/", getTest);

export default router;