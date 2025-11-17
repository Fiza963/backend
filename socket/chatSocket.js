const ChatMessage = require('../models/ChatMessage');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
      socket.join(userId);
    });

    socket.on('sendMessage', async (data) => {
      try {
        const message = await ChatMessage.create({
          sender: data.senderId,
          recipient: data.recipientId,
          message: data.message,
          isTeamChat: data.isTeamChat || false,
        });
        io.to(data.recipientId).emit('receiveMessage', message);
      } catch (error) {
        console.error('Chat error:', error);
      }
    });

    socket.on('disconnect', () => console.log('User disconnected:', socket.id));
  });
};
