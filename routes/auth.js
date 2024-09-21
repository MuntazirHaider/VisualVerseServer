import express from "express";
import {
    login,
    register,
    forgetPassword,
    verifyOtp,
    register_verify_otp,
    changePassword,
    register_newMail, 
} from "../controllers/auth.js";

const router = express.Router();

router.post("/login", login);       // login a user
router.post("/register", register); // register a new user
router.post("/forget-password", forgetPassword); // forget password
router.post("/register_newMail", register_newMail); // verify new email
router.post("/verify-otp", verifyOtp);   // verify user by otp
router.post("/register/verify-otp", register_verify_otp); // otp verification for a new user
router.put("/change-password", changePassword);  // change password

export default router;