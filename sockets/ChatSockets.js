export const ChatsSocketHandler = (io, socket) => {
    socket.on("chats: setup", (userId) => {
        socket.join(userId);
        socket.emit("connected")
    })

    socket.on("chats: join chat", (roomId) => {
        socket.join(roomId);
        console.log("User Joined room this -> ", roomId);
    })

    socket.on("chats: new message send", (newMessage) => {
        const chat = newMessage.chat;

        if (!chat.users) return console.log("No user in chat");

        chat.users.forEach((user) => {
            if (user._id === newMessage.sender._id) return;
            socket.in(user._id).emit("chats: new message received", newMessage);
        })
    })

    socket.on("chats: typing", (roomId, typerId) => {
        socket.in(roomId).emit("chats: typing",roomId ,typerId);
    })

    socket.on("chats: stop typing", (roomId) => {
        socket.in(roomId).emit("chats: stop typing");
    })
    
    //disconnect
    socket.on('disconnect', () => {
        console.log('disconnect user ', socket.id)
    })
}