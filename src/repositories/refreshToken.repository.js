const { RefreshToken } = require('../models');

const create = (userId, token) => RefreshToken.create({ user_id: userId, refreshToken: token });

const findByToken = (token) => RefreshToken.findOne({ where: { refreshToken: token } });

module.exports = { create, findByToken };
