import mongoose from 'mongoose';

const chatSchema = mongoose.Schema({
    chatName: {
        type: String,
        trim: true,
        required: true
    },
    isGroupChat: {
        type: Boolean,
        default: false,
        required: true
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    groupPicture: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;