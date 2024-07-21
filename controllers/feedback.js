import Feedback from "../models/feedback.js";
import User from "../models/user.js";

/** CREATE */
export const createFeedback = async (req, res) => {
    try {
        const { userId, rating, suggestion } = req.body;

        if (!userId) {
            return res.status(400).json({ result: false, message: 'userId is required for feedback' });
        }
        if (!rating && !suggestion) {
            return res.status(400).json({ result: false, message: 'rating or suggestion one of them is required' });
        }

        if (rating > 5) {
            return res.status(400).json({ result: false, message: 'you can rate in the range of 0 to 5' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ result: false, message: "User not found" });
        }

        const newFeedback = new Feedback({
            user: userId,
            rating: rating || 0,
            suggestion: suggestion || "",
        });

        await newFeedback.save();

        res.status(201).json({ result: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
