import express from "express"
import { googleAuth, createEmailUser } from "../controllers/Auth.controller.js";

const router = express.Router();

// should ideally be email or oauth login using JWT cookies set as HTTPOnly and SameSite
router.get("/login", ()=>{});

// either google oauth or email 
// check db if using email, if so pass is required,
// if google oauth, no password required but must set
router.post("/signup/email", createEmailUser);

// router.get("/google/login", googleAuth);

// router.get("/google/callback", googleCallback);

// google login/signup
router.post("/google", googleAuth);

export default router;