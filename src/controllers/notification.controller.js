const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { parsePagination } = require('../utils/pagination');
const notificationService = require('../services/notification.service');

const getAllNotification = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await notificationService.getByUser(req.user.id, pagination);
    return ApiResponse.list(req, res, result, pagination);
});

module.exports = { getAllNotification };
