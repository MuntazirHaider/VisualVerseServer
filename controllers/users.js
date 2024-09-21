import friendRequest from "../models/friendRequests.js";
import User from "../models/user.js";

/* READ */
export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) res.status(400).json("User Not Found");
        res.status(200).json({ result: true, data: user });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

export const getUserFriends = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) res.status(400).json("User Not Found");

        const friends = await Promise.all(
            user.friends.map(async (id) => await User.findById(id))
        );

        const formattedFriends = friends.map(
            ({ _id, firstName, middleName, lastName, occupation, location, picturePath }) => {
                return { _id, firstName, middleName, lastName, occupation, location, picturePath };
            }
        )
        res.status(200).json({ result: true, friends: formattedFriends });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

export const getFriendRequests = async (req, res) => {
    try {
        const { recipientId } = req.params;

        if (!recipientId) {
            return res.status(400).json({ result: false, message: 'Missing recipientId' });
        }

        // Fetch the recipient's friend requests
        const allRequests = await friendRequest.find({ recipient: recipientId })
            .populate({
                path: 'requester',
                select: '_id firstName middleName lastName occupation location picturePath'
            })
            .populate({
                path: 'recipient',
                select: '_id firstName middleName lastName occupation location picturePath'
            });

        res.status(200).json({ result: true, data: allRequests });
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
}

/* CREATE */
export const sendFriendRequest = async (req, res) => {
    try {
        const { recipientId } = req.params;
        const { requesterId } = req.body;

        // Validate required fields
        if (!recipientId || !requesterId) {
            return res.status(400).json({ result: false, message: 'Missing mandatory fields' });
        }

        // Check if the friend request already exists
        const isAlreadySend = await friendRequest.findOne({ recipient: recipientId, requester: requesterId });
        if (isAlreadySend) {
            return res.status(400).json({ result: false, message: 'Friend request is already sent' });
        }

        // Create new friend request
        const newRequest = await friendRequest.create({ recipient: recipientId, requester: requesterId });

        // Populate the created request with multiple fields for requester and recipient
        const newRequestInfo = await friendRequest.findById(newRequest._id)
            .populate({
                path: 'requester',
                select: '_id firstName middleName lastName picturePath'
            })
            .populate({
                path: 'recipient',
                select: '_id firstName middleName lastName picturePath'
            });

        res.status(200).json({ result: true, message: 'Friend request sent', data: newRequestInfo });
    } catch (error) {
        // Use 500 for server errors
        res.status(500).json({ result: false, message: 'Currently Unable to send request' });
    }
}

/* SEARCH */
export const searchUser = async (req, res) => {
    try {
        const key = req.query.search ? {
            $or: [
                { firstName: { $regex: req.query.search, $options: "i" } },
                { middleName: { $regex: req.query.search, $options: "i" } },
                { lastName: { $regex: req.query.search, $options: "i" } },
            ]
        } : {};
        const users = await User.find(key).find({ _id: { $ne: req.user.id } });
        res.status(200).json({ result: true, data: users });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/* UPDATE */
export const addRemoveFriends = async (req, res) => {
    try {
        const { id, friendId } = req.params;
        const user = await User.findById(id);
        const friend = await User.findById(friendId);

        if (user.friends.includes(friendId)) {
            user.friends = user.friends.filter((id) => id !== friendId);
            friend.friends = friend.friends.filter((id) => id !== id);
        } else {
            user.friends.push(friendId)
            friend.friends.push(id);
        }

        await user.save();
        await friend.save();

        const friends = await Promise.all(
            user.friends.map((id) => User.findById(id))
        );

        const formattedFriends = friends.map(({ _id, firstName, middleName, lastName, occupation, location, picturePath }) => ({
            _id,
            firstName,
            middleName,
            lastName,
            occupation,
            location,
            picturePath
        }));

        res.status(200).json({ result: true, friends: formattedFriends });

    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.body;

        // Validate required fields
        if (!requestId) {
            return res.status(400).json({ result: false, message: 'Missing mandatory fields' });
        }

        // find friend request in db
        const request = await friendRequest.findById(requestId);

        if (!request) {
            return res.status(400).json({ result: false, message: 'Friend request not found' });
        }

        // find both users
        const user1 = await User.findById(request.requester);
        const user2 = await User.findById(request.recipient);

        if (!user1 || !user2) {
            return res.status(400).json({ result: false, message: 'Users not found' });
        }

        // Add both users as friends
        if (!user1.friends.includes(user2._id)) {
            user1.friends.push(user2._id);
        }
        if (!user2.friends.includes(user1._id)) {
            user2.friends.push(user1._id);
        }

        await user1.save();
        await user2.save();

        // Remove friend request from db
        await friendRequest.findByIdAndDelete(requestId);

        const friends = await Promise.all(
            user2.friends.map(async (id) => await User.findById(id))
        );

        const formattedFriends = friends.map(
            ({ _id, firstName, middleName, lastName, occupation, location, picturePath }) => {
                return { _id, firstName, middleName, lastName, occupation, location, picturePath };
            }
        )

        res.status(200).json({ result: true, message: 'Friend request accepted', data: { requester: user1, recipient: user2, friends: formattedFriends } });
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { userId, ...rest } = req.body;
        let user = await User.findById(userId);
        if (!user) res.status(400).json("User Not Found");
        await User.updateOne({ _id: userId }, rest);
        user = await User.findById(userId);
        res.status(200).json({ result: true, user });

    } catch (error) {
        res.status(404).json({ result: false, error: error.message });
    }
}

/* DELETE */

export const rejectFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.body;

        // Validate required fields
        if (!requestId) {
            return res.status(400).json({ result: false, message: 'Missing mandatory fields' });
        }

        const request = await friendRequest.findById(requestId);

        if (!request) {
            return res.status(400).json({ result: false, message: 'Friend request not found' });
        }

        // Remove friend request from db
        await friendRequest.findByIdAndDelete(requestId);

        res.status(200).json({ result: true, message: 'Friend request rejected' });
    } catch (error) {
        res.status(500).json({ result: true, error: error.message });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({ result: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const RemoveFriend = async (req, res) => {
    try {
        const { id, friendId } = req.params;

        // Validate input
        if (!id || !friendId) {
            return res.status(400).json({ result: false, message: 'Invalid request parameters' });
        }

        // Find the user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ result: false, message: 'User not found' });
        }

        // Check if the friend exists in the user's friend list
        if (!user.friends.includes(friendId)) {
            return res.status(400).json({ result: false, message: 'Friend not found in your friend list' });
        }

        // Remove the friend from the user's friend list
        user.friends = user.friends.filter((friend) => friend.toString() !== friendId);
        await user.save();

        // Find all remaining friends and format their information
        const friends = await Promise.all(
            user.friends.map((id) => User.findById(id))
        );

        const formattedFriends = friends.map(({ _id, firstName, middleName, lastName, occupation, location, picturePath }) => ({
            _id,
            firstName,
            middleName,
            lastName,
            occupation,
            location,
            picturePath
        }));

        res.status(200).json({ result: true, data: formattedFriends });

    } catch (error) {
        // Return the actual error message for debugging
        res.status(500).json({ result: false, message: 'Currently unable to remove friend', error: error.message });
    }
};
