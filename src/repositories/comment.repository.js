const { Comment } = require('../models');
const { findPaged } = require('./helpers');
const { userInclude } = require('./includes');

const findBySong = (songId, order, pagination) =>
    findPaged(
        Comment,
        {
            where: { song_id: songId },
            include: userInclude(),
            order: [['created_at', order]],
        },
        pagination,
    );

const findByIdWithUser = (id) => Comment.findOne({ where: { id }, include: userInclude() });

const create = (data) => Comment.create(data);

module.exports = { findBySong, findByIdWithUser, create };
