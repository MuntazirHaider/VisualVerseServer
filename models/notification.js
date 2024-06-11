import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
    notificationMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    notificationChat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    }
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;