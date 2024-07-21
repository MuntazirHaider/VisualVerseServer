const allUsersId = new Map();

export const VideoSocketHandler = async (io, socket) => {
    socket.on('video call: set user', () => {
        allUsersId.set(socket.userId.toString(), socket.id);
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit("callEnded")
    });

    socket.on('video call: call user', ({ userToCall, signalData, caller }) => {
        io.to(allUsersId.get(userToCall)).emit('video call: received call', { caller, signal: signalData });
    });

    socket.on('video call: answer call', ({ signal, to }) => {
        io.to(allUsersId.get(to)).emit('video call: call accepted', signal);
    });

    socket.on('video call: end call', ({ to }) => {
        io.to(allUsersId.get(to)).emit('video call: call ended');
    });

    socket.on('video call: cancel call', ({ to }) => {
        io.to(allUsersId.get(to)).emit('video call: call cancelled');
    });

    socket.on('video call: decline call', ({ to }) => {
        io.to(allUsersId.get(to)).emit('video call: call declined');
    })

    socket.on('video call: toggle camera', ({ camera, to }) => {
        io.to(allUsersId.get(to)).emit('video call: toggle camera', camera);
    });

    socket.on('video call: toggle microphone', ({ microphone, to }) => {
        io.to(allUsersId.get(to)).emit('video call: toggle microphone', microphone);
    });

    socket.on('video call: camera-change', ({ stream, to }) => {
        io.to(allUsersId.get(to)).emit('video call: camera-change', { streamId: stream });
    });
}