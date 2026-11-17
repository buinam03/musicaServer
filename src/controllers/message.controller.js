const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { parsePagination } = require('../utils/pagination');
const messageService = require('../services/message.service');

const getAllMessage = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await messageService.getAll(pagination);
    return ApiResponse.list(req, res, result, pagination);
});

const sendMessage = asyncHandler(async (req, res) => {
    const message = await messageService.sendToRoom(req.user.id, req.body);
    return ApiResponse.created(res, message, 'Sent');
});

/** GET /getMessage?receive_id= - tin nhắn user hiện tại gửi cho receive_id */
const getMessage = asyncHandler(async (req, res) => {
    const receiverId = req.query.receive_id ?? req.body?.receive_id;
    return ApiResponse.ok(res, await messageService.getBetween(req.user.id, receiverId));
});

const getRoomMessage = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await messageService.getRoomMessages(req.params.roomId, pagination);
    return ApiResponse.list(req, res, result, pagination);
});

const getASCRoom = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await messageService.getFirstSentBy(req.user.id));
});

const getAllRoomsByUser = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await messageService.getRoomsOfUser(req.user.id));
});

/** DELETE /deleteMessage  body: { id } (hoặc ?id=) */
const deleteMessage = asyncHandler(async (req, res) => {
    await messageService.remove(req.body?.id ?? req.query.id);
    return ApiResponse.ok(res, null, 'Message deleted successfully.');
});

module.exports = {
    getAllMessage,
    sendMessage,
    getMessage,
    getRoomMessage,
    getASCRoom,
    getAllRoomsByUser,
    deleteMessage,
};
