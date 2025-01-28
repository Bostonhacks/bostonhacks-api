import express from "express"
import { createGoogleUser, createEmailUser } from "../controllers/Auth.controller.js";

const router = express.Router();

// should ideally be email or oauth login using JWT cookies set as HTTPOnly and SameSite
router.get("/login", ()=>{});

// either google oauth or email 
// check db if using email, if so pass is required,
// if google oauth, no password required but must set
// authProvider field either way
router.post("/signup/email", createEmailUser);

router.post("/signup/google", createGoogleUser);

export default router;