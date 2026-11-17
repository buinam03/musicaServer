const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');
const { requireFields } = require('../utils/validate');
const userRepository = require('../repositories/user.repository');
const refreshTokenRepository = require('../repositories/refreshToken.repository');
const tokenService = require('./token.service');

const SALT_ROUNDS = 10;

const register = async ({ username, email, password }) => {
    requireFields({ username, email, password }, ['username', 'email', 'password']);

    const existing = await userRepository.findByEmail(email);
    if (existing) throw AppError.badRequest('Email da ton tai');

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({ username, email, password: hashedPassword });

    const { password: _ignored, ...safeUser } = user.toJSON();
    return safeUser;
};

const login = async ({ email, password }) => {
    requireFields({ email, password }, ['email', 'password']);

    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) throw AppError.notFound('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw AppError.badRequest('Wrong Password');

    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);
    await refreshTokenRepository.create(user.id, refreshToken);

    return { accessToken, refreshToken, userId: user.id };
};

const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) throw AppError.forbidden('Refresh Token is required');

    const stored = await refreshTokenRepository.findByToken(refreshToken);
    if (!stored) throw AppError.forbidden('Invalid Refresh Token');

    let payload;
    try {
        payload = tokenService.verifyRefreshToken(refreshToken);
    } catch (err) {
        throw AppError.forbidden('Refresh Token has expired');
    }

    const user = await userRepository.findById(payload.id);
    if (!user) throw AppError.notFound('User not found');

    return { accessToken: tokenService.generateAccessToken(user) };
};

module.exports = { register, login, refreshAccessToken };
