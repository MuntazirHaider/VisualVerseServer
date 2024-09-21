import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    otp: {
        type: Number,
        default: 0,
        required: true
    },
    email: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 130
    }
},
    { timestamps: true }
);

const OTP = mongoose.model("OTP", OtpSchema);

export default OTP;