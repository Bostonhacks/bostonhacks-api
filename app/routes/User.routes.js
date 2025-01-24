import express from "express"

const router = express.Router();


router.get("/:username", getUser);

export default router;