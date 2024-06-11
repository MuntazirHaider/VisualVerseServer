import mongoose from 'mongoose';

const messageSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        trim: true,
        required: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    },
    contentType: {
        type: String,
        default: "text"
    }
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;