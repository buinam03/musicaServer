const messageService = require('../services/message.service');

/**
 * Chat realtime.
 * Client events:  'room' (roomId)  |  'send' ({ senderId, receiverId, room, msg })
 * Server events:  'receive' (message payload)  |  'messageError' ({ error, details })
 */
function registerChatSocket(io) {
    io.on('connection', (socket) => {
        socket.on('room', (roomId) => {
            socket.join(roomId);
        });

        socket.on('send', async (data = {}) => {
            try {
                const payload = await messageService.sendRealtime(data);
                // Gửi tới tất cả thành viên trong room (bao gồm người gửi)
                io.to(data.room).emit('receive', payload);
            } catch (error) {
                socket.emit('messageError', {
                    error: 'Không thể gửi tin nhắn',
                    details: error.message,
                });
            }
        });
    });
}

module.exports = registerChatSocket;
