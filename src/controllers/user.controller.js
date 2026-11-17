const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { parsePagination } = require('../utils/pagination');
const userService = require('../services/user.service');
const externalService = require('../services/external.service');

const getAllUser = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await userService.getAll(pagination);
    return ApiResponse.list(req, res, result, pagination);
});

const getUserById = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await userService.getById(req.params.id));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await userService.getCurrent(req.user.id));
});

const getRandomUser = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await userService.getRandom(req.user.id));
});

const getProvince = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await externalService.getProvinces());
});

const updateProfilePicture = asyncHandler(async (req, res) => {
    const user = await userService.updateProfilePicture(req.user.id, req.body.profilePicture);
    return ApiResponse.ok(res, user, 'Profile picture updated');
});

const updateHeaderPicture = asyncHandler(async (req, res) => {
    const user = await userService.updateHeaderPicture(req.user.id, req.body.headerpicture);
    return ApiResponse.ok(res, user, 'Header picture updated');
});

const updateUserInfo = asyncHandler(async (req, res) => {
    const user = await userService.updateInfo(req.user.id, req.body);
    return ApiResponse.ok(res, user, 'update success');
});

module.exports = {
    getAllUser,
    getUserById,
    getCurrentUser,
    getRandomUser,
    getProvince,
    updateProfilePicture,
    updateHeaderPicture,
    updateUserInfo,
};
