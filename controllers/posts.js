import Post from '../models/post.js';
import User from '../models/user.js';


/* CREATE */
export const createPost = async (req, res) => {
    try {
        const { userId, description, picturePath, mediaType } = req.body;
        if (!description && !picturePath) return res.status(400).json({ message: 'Caption or Picture is required to post' });
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ message: 'User Not Found' });
        user.totalPosts++;
        const newPost = new Post({
            userId,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            description,
            userPicturePath: user.picturePath,
            picturePath,
            mediaType,
            likes: {},
            comments: []
        });
        await user.save();
        await newPost.save();
        const posts = await Post.find({}).sort({ createdAt: -1 });
        res.status(201).json({ result: true, posts });
    } catch (error) {
        res.status(409).json({ error: error.message });
    }
}

export const createComment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        post.comments.push({ 
            "userId": req.body.userId,
            "name": req.body.name,
            "picturePath": req.body.picturePath,
            "comment": req.body.comment
         })

         const updatedCommnets = post.comments;
         
        await post.save();
        res.status(200).json({result: true, updatedCommnets});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/* READ */
export const getFeedPosts = async (req, res) => {
    try {
        const posts = await Post.find({}).sort({ createdAt: -1 });
        res.status(201).json({ result: true, posts });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const posts = await Post.find({ userId }).sort({ createdAt: -1 });
        res.status(201).json({  result: true, posts });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}


/* UPDATE */
export const likePost = async (req, res) => {
    try {
        const { userId } = req.body;
        const { id } = req.params;

        
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const user = await User.findById(post.userId);
        if (!user) return res.status(400).json({ message: 'User Not Found' });

        const isLiked = post.likes.get(userId);
        if (isLiked) {
            post.likes.delete(userId);
            user.impressions--;
        } else {
            post.likes.set(userId, true);
            user.impressions++;
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { likes: post.likes },
            { new: true }
        );
        await user.save();
        res.status(200).json({result: true, post: updatedPost});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/* Delete */

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        await Post.findByIdAndDelete(id);

        res.status(200).json({ result: true, message: 'Post deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { deletedComment } = req.body;
        console.log(deletedComment);
        
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        post.comments = post.comments.filter((comment) => {
            return comment.comment !== deletedComment;
        });

        const updatedPost = await post.save();

        res.status(200).json({ result: true, response: updatedPost });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}