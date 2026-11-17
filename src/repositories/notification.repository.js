const { Notification } = require('../models');
const { findPaged } = require('./helpers');
const { userInclude } = require('./includes');

const findByUser = (userId, pagination) =>
    findPaged(
        Notification,
        {
            where: { user_id: userId },
            include: [userInclude(['username', 'profile_picture'])],
            order: [['created_at', 'DESC']],
        },
        pagination,
    );

const create = (data) => Notification.create(data);

module.exports = { findByUser, create };
