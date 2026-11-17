const { Op, literal, fn, col } = require('sequelize');
const { User, Follows } = require('../models');
const { findPaged } = require('./helpers');

const findById = (id, options = {}) => User.findByPk(id, options);

const findByEmail = (email) => User.findOne({ where: { email } });

/** Có kèm password - chỉ dùng cho xác thực. */
const findByEmailWithPassword = (email) => User.scope('withPassword').findOne({ where: { email } });

const findAll = (pagination) => findPaged(User, {}, pagination);

const create = (data) => User.create(data);

const updateById = (id, data) => User.update(data, { where: { id } });

const searchByUsername = (keyword, attributes) =>
    User.findAll({
        where: { username: { [Op.like]: `%${keyword}%` } },
        attributes,
    });

/** Lấy ngẫu nhiên user (trừ currentUserId), kèm quan hệ follow của currentUser với từng user. */
const findRandomExcept = (currentUserId, limit) =>
    User.findAll({
        where: { id: { [Op.ne]: currentUserId } },
        order: literal('RAND()'),
        limit,
        include: [
            {
                model: Follows,
                as: 'followers',
                where: { follower_id: currentUserId },
                required: false,
            },
        ],
    });

/** Đếm follower cho nhiều user trong 1 query. Trả về Map<userId, count>. */
const countFollowersByUserIds = async (userIds) => {
    if (userIds.length === 0) return new Map();
    const rows = await Follows.findAll({
        attributes: ['following_id', [fn('COUNT', col('id')), 'count']],
        where: { following_id: userIds },
        group: ['following_id'],
        raw: true,
    });
    return new Map(rows.map((r) => [r.following_id, Number(r.count)]));
};

module.exports = {
    findById,
    findByEmail,
    findByEmailWithPassword,
    findAll,
    create,
    updateById,
    searchByUsername,
    findRandomExcept,
    countFollowersByUserIds,
};
