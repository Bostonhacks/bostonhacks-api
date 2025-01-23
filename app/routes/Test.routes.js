import express from "express"
import TestController from "../controllers/Test.controller.js";

const router = express.Router();


router.get("/", TestController.getTest);