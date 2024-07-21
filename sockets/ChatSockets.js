// import { getUserDetailsFromToken } from "../services/tokenService.js";
const onlineUsers = new Set();

export const ChatsSocketHandler = async (io, socket) => {

  socket.on('user: connected', (userId) => {

    // Check if the user is not in the online users set
    if (!onlineUsers.has(userId)) {
      // Add the new user to the online users set and join their room
      onlineUsers.add(userId);
      socket.join(userId);
    }

    // Prepare updated status (array of online user IDs)
    const updatedStatus = Array.from(onlineUsers);

    // Emit 'user: status' to each online user with the updated status array
    updatedStatus.forEach((user) => {
      socket.join(user); // Join the room of each online user (if necessary)
    });

    updatedStatus.forEach((user) => {
      socket.to(user).emit('user: status', updatedStatus);
    });

    socket.emit('user: status', updatedStatus);       // send status to yourself
  });

  socket.on('chats: group created', () => {
    onlineUsers.forEach((val) => {
      socket.to(val).emit('chats: new group chats joined');
    })
  });

  socket.on('chats: group updated', (updatedGroup) => {
    onlineUsers.forEach((val) => {
      socket.to(val).emit('chats: group chat updated', updatedGroup);
    })
  });

  socket.on('chats: leave group', (leavedGroup) => {
    onlineUsers.forEach((val) => {
      socket.to(val).emit('chats: group chat leaved', leavedGroup);
    })
  })


  socket.on("chats: setup", (userId) => {
    socket.join(userId);
  });

  socket.on("chats: join chat", (roomId) => {
    socket.join(roomId);
  });

  socket.on("chats: new message send", (newMessage) => {
    const chat = newMessage.chat;

    if (!chat.users) return console.warn("No user in chat");

    chat.users.forEach((user) => {
      if (user._id === newMessage.sender._id) return;
      socket.to(user._id).emit("chats: new message received", newMessage);
    });
  });

  socket.on("chats: typing", (roomId, typerId) => {
    socket.to(roomId).emit("chats: typing", roomId, typerId);
  });

  socket.on("chats: stop typing", (roomId) => {
    socket.to(roomId).emit("chats: stop typing");
  });

  socket.on('user: disconnect', () => {
    onlineUsers.delete(socket.userId.toString());
    const updatedStatus = Array.from(onlineUsers);
    updatedStatus.forEach((user) => {
      socket.to(user).emit('user: status', updatedStatus);
    });
  })

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.userId.toString());
    const updatedStatus = Array.from(onlineUsers);
    updatedStatus.forEach((user) => {
      socket.to(user).emit('user: status', updatedStatus);
    });
  });
};
