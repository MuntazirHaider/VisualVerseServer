import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        default: -1,
        required: true
    },
    suggestion: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);

const Feedback = mongoose.model("Feedback", FeedbackSchema);

export default Feedback;