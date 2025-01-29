import express from "express"
import { googleAuth, createEmailUser, googleCallback } from "../controllers/Auth.controller.js";

const router = express.Router();

// should ideally be email or oauth login using JWT cookies set as HTTPOnly and SameSite
router.get("/login", ()=>{});

// either google oauth or email 
// check db if using email, if so pass is required,
// if google oauth, no password required but must set
// authProvider field either way
router.post("/signup/email", createEmailUser);

router.get("/login/google", googleAuth);

router.get("/google/callback", googleCallback);

export default router;