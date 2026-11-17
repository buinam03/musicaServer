const AppError = require('../utils/AppError');
const { requireFields } = require('../utils/validate');
const { getRoomId, parseRoomId } = require('../utils/roomId');
const messageRepository = require('../repositories/message.repository');
const userRepository = require('../repositories/user.repository');

const getAll = async (pagination) => {
    const result = await messageRepository.findAll(pagination);
    if (result.total === 0) throw AppError.notFound('No message found');
    return result;
};

/** Chuẩn hoá room và xác định người nhận từ room + người gửi. */
const resolveRoom = (rawRoomId, senderId) => {
    const roomId = getRoomId(...parseRoomId(rawRoomId));
    if (!roomId) throw AppError.badRequest('Cannot send to yourself.');

    const [idA, idB] = parseRoomId(roomId);
    if (Number(senderId) !== idA && Number(senderId) !== idB) {
        throw AppError.forbidden('You are not a member of this room');
    }
    const receiverId = idA === Number(senderId) ? idB : idA;
    return { roomId, receiverId };
};

/** Gửi tin nhắn qua REST: người nhận được suy ra từ room_id. */
const sendToRoom = async (senderId, { room_id: rawRoomId, message }) => {
    requireFields({ room_id: rawRoomId, message }, ['room_id', 'message']);

    const { roomId, receiverId } = resolveRoom(rawRoomId, senderId);
    return messageRepository.create({ room_id: roomId, send_id: senderId, receive_id: receiverId, message });
};

/**
 * Gửi tin nhắn qua socket. Trả về payload để broadcast tới room.
 */
const sendRealtime = async ({ senderId, receiverId, room, msg }) => {
    if (!senderId || !receiverId || !room || !msg) throw AppError.badRequest('Missing required fields');

    const sender = await userRepository.findById(senderId, { attributes: ['id', 'username', 'profile_picture'] });
    if (!sender) throw AppError.notFound('Sender not found');

    const saved = await messageRepository.create({
        send_id: senderId,
        receive_id: receiverId,
        room_id: room,
        message: msg,
    });

    return {
        id: saved.id,
        sender: { id: sender.id, username: sender.username, profile_picture: sender.profile_picture },
        message: saved.message,
        room_id: saved.room_id,
        created_at: saved.created_at,
    };
};

const getBetween = (senderId, receiverId) => {
    requireFields({ receive_id: receiverId }, ['receive_id']);
    return messageRepository.findBetween(senderId, receiverId);
};

const getRoomMessages = (roomId, pagination) => {
    const [a, b] = parseRoomId(roomId);
    if (!a || !b || a === b) throw AppError.badRequest('Error when open room');
    return messageRepository.findByRoom(roomId, pagination);
};

const getFirstSentBy = (userId) => messageRepository.findFirstSentBy(userId);

/** Danh sách phòng chat của user, mỗi phòng kèm partner và tin nhắn mới nhất. */
const getRoomsOfUser = async (userId) => {
    const rooms = await messageRepository.findRoomsOfUser(userId);
    return rooms.map((room) => ({
        room_id: room.room_id,
        latest_message: room.latest_message,
        latest_message_time: room.latest_message_time,
        partner: room.sender.id === userId ? room.receiver : room.sender,
    }));
};

const remove = async (messageId) => {
    requireFields({ id: messageId }, ['id']);
    const deleted = await messageRepository.destroyById(messageId);
    if (!deleted) throw AppError.notFound('Message not found.');
};

module.exports = {
    getAll,
    sendToRoom,
    sendRealtime,
    getBetween,
    getRoomMessages,
    getFirstSentBy,
    getRoomsOfUser,
    remove,
};
