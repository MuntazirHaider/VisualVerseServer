import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import OTP from "../models/otp.js"
import { sendMail } from "../services/mailService.js";
import { generateOtp } from "../services/otpService.js";

/* REGISTER */
export const register = async (req, res) => {
    try {
        const {
            firstName,
            middleName,
            lastName,
            email,
            password,
            picturePath,
            friends,
            location,
            occupation,
        } = req.body;

        if (!firstName || !lastName || !email || !password) return res.status(400).json({ result: false, message: 'Please provide all mandatory fields' });

        const isExist = await User.findOne({ email })
        if (isExist) return res.status(400).json({ result: false, message: "User Already Exist With This Credentials" })

        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            middleName,
            lastName,
            email,
            password: hashPassword,
            picturePath: picturePath || process.env.USER_DEFAULT_IMG,
            friends,
            location,
            occupation,
            totalPosts: 0,
        });
        const savedUser = await newUser.save();
        res.status(201).json({ result: true, savedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/* LOGGING IN */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ result: false, message: 'Please provide an email and a password' });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ result: false, message: "User not found" });

        const isPassMatch = await bcrypt.compare(password, user.password);
        if (!isPassMatch) return res.status(400).json({ result: false, message: "Invalid Credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        delete user.password;

        res.status(201).json({ token, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/* Forget Password */
export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ result: false, message: "Email field is mandatory" });

        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ result: false, message: "User with this email is not found" });

        const otp = generateOtp();

        const isSend = await sendMail(email, otp);

        if (isSend) {
            await OTP.findOneAndDelete({ user: user._id });
            const otpInstance = new OTP({
                user: user._id,
                otp,
                createdAt: Date.now()
            });
            await otpInstance.save();

            return res.status(200).json({ result: true, message: "OTP sent to registered email" });
        } else {
            return res.status(500).json({ result: false, message: "Failed to send OTP. Please try again later." });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* Verify OTP */
export const verifyOtp = async (req, res) => {
    try {
        const { otp, email } = req.body;

        if (!otp || otp.length < 6) return res.status(400).json({ result: false, message: "Invalid OTP" });

        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ result: false, message: "User with this email is not found" });

        const verified = await OTP.findOne({ user: user._id });

        if (verified) {
            res.status(200).json({ result: true, message: "User is verified" });
        } else {
            res.status(404).json({ result: false, message: "This OTP is expired" });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

/* Change Password */
export const changePassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ result: false, message: "Email and Password are mandatory fields" });

        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);

        const user = await User.findOneAndUpdate({ email: email }, { password: hashPassword }, { new: true });
        if (user) {
            return res.status(200).json({ result: true, message: "Password changed successfully" });
        } else {
            return res.status(404).json({ result: false, message: "User not found" });
        }
    } catch (error) {
        return res.status(500).json({ result: false, message: "Internal server error" });
    }
}

