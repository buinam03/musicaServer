const jwt = require('jsonwebtoken');
const env = require('../config/env');

/** Payload JWT chỉ chứa thông tin tối thiểu. */
const toPayload = (user) => ({ id: user.id, username: user.username });

const generateAccessToken = (user) =>
    jwt.sign(toPayload(user), env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresIn });

const generateRefreshToken = (user) =>
    jwt.sign(toPayload(user), env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });

/** Ném lỗi nếu token không hợp lệ / hết hạn. */
const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);

const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };
