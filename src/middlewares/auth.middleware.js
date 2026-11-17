const ApiResponse = require('../utils/ApiResponse');
const tokenService = require('../services/token.service');

/**
 * Xác thực JWT trong header Authorization: "Bearer <token>".
 * Giữ nguyên message "Access Denied" / "Invalid Token" vì frontend dựa vào message này để logout.
 */
const authMiddleware = (req, res, next) => {
    const header = req.header('Authorization');
    if (!header) return ApiResponse.error(res, 401, 'Access Denied');

    try {
        req.user = tokenService.verifyAccessToken(header.replace('Bearer ', ''));
        return next();
    } catch (err) {
        return ApiResponse.error(res, 403, 'Invalid Token');
    }
};

module.exports = { authMiddleware };
