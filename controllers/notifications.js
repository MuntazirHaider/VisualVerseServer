import Chat from "../models/chat.js";
import Message from "../models/message.js";
import Notification from "../models/notification.js";
import User from "../models/user.js";

/* READ */
export const fetchAllNotifications = async (req, res) => {
    const userId = req.user.id;

    try {
        let allNotifications = await Notification.find({}).populate({
            path: 'notificationChat',
        });

        let userNotifications = allNotifications.filter(notification =>
            notification.notificationChat.users.includes(userId)
        );

        // Populate notificationMessage field for the filtered notifications
        userNotifications = await Notification.populate(userNotifications, [
            { path: 'notificationMessage' },
        ]);

        // Conditionally populate users field in notificationChat for non-group chats
        for (let notification of userNotifications) {
            if (!notification.notificationChat.isGroupChat) {
                notification = await User.populate(notification, {
                    path: 'notificationChat.users',
                    select: 'firstName middleName lastName picturePath'
                });
            }
        }

        res.status(200).json({ result: true, data: userNotifications });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/* CREATE */
export const updateNotifications = async (req, res) => {
    const { chatId, messageId } = req.body;
    if (!chatId || !messageId) res.status(404).send({ result: false, message: "Dont have mandatory fields" });
    const newNotification = {
        notificationMessage: messageId,
        notificationChat: chatId
    }
    try {
        var notification = await Notification.create(newNotification);

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).send({ result: false, message: "Message not found" });
        }

        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: message
        })

        notification = await Notification.populate(notification, [
            { path: "notificationMessage" },
            { path: "notificationChat" },
        ]);

        if (!notification.notificationChat.isGroupChat) {
            notification = await User.populate(notification, [
                { path: 'notificationChat.users', select: "firstName middleName lastName picturePath" },
            ]);
        }

        res.status(200).json({ result: true, data: notification });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


/* DELETE */
export const deleteNotifications = async (req, res) => {
    const { chatId } = req.body;

    if (chatId) {
        // If chatId is provided
        try {
            await Notification.deleteMany({ notificationChat: chatId });
            return res.status(200).json({ result: true, message: "Notifications removed successfully" });
        } catch (error) {
            return res.status(400).json({ result: false, message: error.message });
        }
    } else {
        // If chatId is not provided, delete all notifications
        try {
            await Notification.deleteMany({});
            return res.status(200).json({ result: true, message: "All notifications removed successfully" });
        } catch (error) {
            return res.status(400).json({ result: false, message: error.message });
        }
    }
};

