import User from "../models/user.js";

/* READ */
export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) res.status(400).json("User Not Found");
        res.status(200).json({ result: true, data:user });
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
        res.status(200).json({ result: true, friends:formattedFriends });
    } catch (error) {
        res.status(404).json({ error: error.message });
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

export const updateProfile = async (req, res) => {
    try {
        const { userId, ...rest} = req.body;
        let user = await User.findById(userId);
        if (!user) res.status(400).json("User Not Found");
        await User.updateOne({ _id: userId }, rest);
        user = await User.findById(userId);
        res.status(200).json({ result: true, user});

    } catch (error) {
        res.status(404).json({ result: false, error: error.message });
    }
}

/* DELETE */

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