import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        min: 2,
        max: 15,
    },
    middleName: {
        type: String,
        default: "",
        max: 15,
    },
    lastName: {
        type: String,
        required: true,
        min: 2,
        max: 20,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        max: 50,
    },
    password: {
        type: String,
        required: true,
        unique: true,
        min: 6,
        max: 20,
    },
    picturePath: {
        type: String,
        default: ""
    },
    friends: {
        type: Array,
        default: []
    },
    location: String,
    occupation: String,
    totalPosts: {
        type: Number,
        default: 0
    },
    impressions: {
        type: Number,
        default: 0
    }
},
    { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;