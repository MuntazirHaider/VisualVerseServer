import Chat from '../models/chat.js';
import Message from '../models/message.js';
import User from '../models/user.js';


/* CREATE */
export const accessChat = async (req, res) => {

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User Not Found' });

    let isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user.id } } },
            { users: { $elemMatch: { $eq: userId } } }
        ],
    }).populate("users", "-password").populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name picturePath email"
    });


    if (isChat.length > 0) {
        res.send({ result: true, data: isChat[0] });
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user.id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users",
                "-password"
            );
            res.status(200).json({ result: true, data: FullChat });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
}


export const createGroup = async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all mandatory feilds" });
    }

    var users = JSON.parse(req.body.users);
    users.push(req.user.id);
    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user.id,
            groupPicture: req.body.groupPicture || process.env.GROUP_DEFAULT_IMG
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json({ result: true, data: fullGroupChat });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

export const addToGroup = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        const updatedChat = await Chat.findByIdAndUpdate(chatId,
            {
                $push: { users: userId },
            },
            {
                new: true,
            })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChat) {
            res.status(400).json({ message: "Chat not found" });
        } else {
            res.status(201).json({ result: true, data: updatedChat });
        }
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

/* SEARCH */
export const searchChatUser = async (req, res) => {
    try {
        const currUser = await User.findById(req.user.id);
        const key = req.query.search ? {
            $or: [
                { firstName: { $regex: req.query.search, $options: "i" } },
                { middleName: { $regex: req.query.search, $options: "i" } },
                { lastName: { $regex: req.query.search, $options: "i" } },
            ]
        } : {};
        let users = await User.find(key).find({ _id: { $ne: req.user.id } });
        users = users.filter((e) => currUser.friends.includes(e._id));
        res.status(200).json({ result: true, data: users });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


/* GET */
export const fetchChats = async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "name picturePath email",
                });
                res.status(200).send({ result: true, data: results });
            });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

/* Update */
export const renameGroup = async (req, res) => {
    try {
        const { chatId, chatName } = req.body;
        const updatedChat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChat) {
            res.status(400).json({ message: "Chat not found" });
        } else {
            res.status(201).json({ result: true, data: updatedChat });
        }
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

export const updateGroup = async (req, res) => {
    if (!req.body.users || !req.body.name || !req.body.admin) {
        return res.status(400).send({ message: "Please Fill all mandatory feilds" });
    }

    var users = JSON.parse(req.body.users);
    users.push(req.user.id);
    try {
        const groupChat = await Chat.findByIdAndUpdate(req.body.chatId, {
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.body.admin,
            groupPicture: req.body.groupPicture
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json({ result: true, data: fullGroupChat });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

/* DELETE */
export const removeFromGroup = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        const updatedChat = await Chat.findByIdAndUpdate(chatId,
            {
                $pull: { users: userId },
            },
            {
                new: true,
            })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChat) {
            res.status(400).send({ message: "Chat not found" });
        }
        if (updatedChat?.users.length < 2) {
            await Chat.findByIdAndDelete(chatId);
        }
        res.status(201).json({ result: true, data: updatedChat });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}