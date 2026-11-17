const { Op } = require('sequelize');
const { Follows } = require('../models');
const { findPaged } = require('./helpers');
const { userInclude } = require('./includes');

const followerInclude = (extra = {}) => userInclude(undefined, { as: 'follower', ...extra });
const followingInclude = (extra = {}) => userInclude(undefined, { as: 'following', ...extra });
const usernameLike = (keyword) => ({ username: { [Op.like]: `%${keyword}%` } });

const findAll = (pagination) => findPaged(Follows, {}, pagination);

const findOne = (followerId, followingId) =>
    Follows.findOne({ where: { follower_id: followerId, following_id: followingId } });

const create = (followerId, followingId) => Follows.create({ follower_id: followerId, following_id: followingId });

const destroy = (followerId, followingId) =>
    Follows.destroy({ where: { follower_id: followerId, following_id: followingId } });

const findByFollower = (followerId) => Follows.findAll({ where: { follower_id: followerId } });

const countFollowers = (userId) => Follows.count({ where: { following_id: userId } });

const countFollowing = (userId) => Follows.count({ where: { follower_id: userId } });

/** Danh sách người theo dõi (followers) của userIds, kèm thông tin follower. */
const findFollowersOf = (userIds, pagination) =>
    findPaged(Follows, { where: { following_id: userIds }, include: [followerInclude()] }, pagination);

/** Danh sách người mà userId đang theo dõi, kèm thông tin following. */
const findFollowingOf = (userId, pagination) =>
    findPaged(Follows, { where: { follower_id: userId }, include: [followingInclude()] }, pagination);

const searchFollowersOf = (userId, keyword, pagination) =>
    findPaged(
        Follows,
        { where: { following_id: userId }, include: [followerInclude({ where: usernameLike(keyword) })] },
        pagination,
    );

const searchFollowingOf = (userId, keyword, pagination) =>
    findPaged(
        Follows,
        { where: { follower_id: userId }, include: [followingInclude({ where: usernameLike(keyword) })] },
        pagination,
    );

/** Trong danh sách candidateIds, những id nào đang được followerId theo dõi. Trả về Set. */
const findFollowedIdsAmong = async (followerId, candidateIds) => {
    if (candidateIds.length === 0) return new Set();
    const rows = await Follows.findAll({
        where: { follower_id: followerId, following_id: candidateIds },
        attributes: ['following_id'],
    });
    return new Set(rows.map((r) => r.following_id));
};

module.exports = {
    findAll,
    findOne,
    create,
    destroy,
    findByFollower,
    countFollowers,
    countFollowing,
    findFollowersOf,
    findFollowingOf,
    searchFollowersOf,
    searchFollowingOf,
    findFollowedIdsAmong,
};
