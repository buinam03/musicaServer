const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { parsePagination } = require('../utils/pagination');
const achievementService = require('../services/achievement.service');

const getAllAchievement = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await achievementService.getAll(pagination);
    return ApiResponse.list(req, res, result, pagination);
});

const createAchievement = asyncHandler(async (req, res) => {
    const achievement = await achievementService.create(req.body);
    return ApiResponse.created(res, achievement, 'Achievement created successfully');
});

/** GET /getAllUserArchievement?userId= (mặc định: user đang đăng nhập) */
const getAllUserArchievement = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const userId = req.query.userId ?? req.query.UserId ?? req.body?.UserId ?? req.user.id;
    const result = await achievementService.getByUser(userId, pagination);
    return ApiResponse.list(req, res, result, pagination);
});

const savedAchievementByUser = asyncHandler(async (req, res) => {
    const results = await achievementService.saveForUser(req.body);
    return ApiResponse.ok(res, results, 'User achievements saved successfully');
});

module.exports = { getAllAchievement, createAchievement, getAllUserArchievement, savedAchievementByUser };
