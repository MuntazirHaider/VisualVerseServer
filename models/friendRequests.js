import mongoose from "mongoose";

const friendRequestSchema = mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const friendRequest = mongoose.model('FriendRequest', friendRequestSchema);

export default friendRequest;