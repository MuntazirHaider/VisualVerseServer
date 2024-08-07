import Chat from "../models/chat.js";
import Message from "../models/message.js"
import User from "../models/user.js";

/* READ  */
export const getAllMessages = async (req, res) => {
    try {
        const message = await Message.find({ chat: req.params.chatId })
            .populate("sender", "firstName middleName lastName picturePath email")
            .populate("chat");

        res.status(200).json({ result: true, data: message });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/* CREATE */
export const sendMessage = async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        return res.status(400).send({ result: false, message: "Don't have mandatory fields" });
    }

    const newMessage = {
        sender: req.user.id,
        content: content,
        chat: chatId,
        contentType: req.body?.contentType ? req.body.contentType : "text"
    };

    try {
        let message = await Message.create(newMessage);

        if (newMessage.contentType !== 'info') {
            message = await Message.populate(message, [
                { path: "sender", select: "firstName middleName lastName picturePath email" },
                { path: "chat" }
            ]);
            message = await User.populate(message, {
                path: "chat.users",
                select: "firstName middleName lastName picturePath email"
            });

            await Chat.findByIdAndUpdate(req.body.chatId, {
                latestMessage: message
            });
        }

        return res.status(200).json({ result: true, data: message });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};
