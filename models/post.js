import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String,
        required: true
    },
    location: String,
    description: String,
    picturePath: String,
    userPicturePath: String,
    likes: {
        type: Map,
        default: {},
        of: Boolean
    },
    comments: {
        type: Array,
        default: []
    }
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);

export default Post ;