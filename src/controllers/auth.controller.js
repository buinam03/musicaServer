const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    return ApiResponse.created(res, user, 'Dang ky thanh cong');
});

const login = asyncHandler(async (req, res) => {
    const tokens = await authService.login(req.body);
    return ApiResponse.ok(res, tokens, 'Login successfully');
});

const refreshToken = asyncHandler(async (req, res) => {
    const result = await authService.refreshAccessToken(req.body.refreshTokens);
    return ApiResponse.ok(res, result, 'Token refreshed');
});

module.exports = { register, login, refreshToken };
