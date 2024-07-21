import express from "express";
import {
    login,
    register,
    forgetPassword,
    verifyOtp,
    changePassword
} from "../controllers/auth.js";

const router = express.Router();

router.post("/login", login);       // login a user
router.post("/register", register); // register a new user
router.post("/forget-password", forgetPassword); // forget password
router.post("/verify-otp", verifyOtp);   // verify user by otp
router.put("/change-password", changePassword);  // change password

export default router;