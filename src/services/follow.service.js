const AppError = require('../utils/AppError');
const { requireFields } = require('../utils/validate');
const followRepository = require('../repositories/follow.repository');
const userRepository = require('../repositories/user.repository');
const notificationService = require('./notification.service');

const getAll = async (pagination) => {
    const result = await followRepository.findAll(pagination);
    if (result.total === 0) throw AppError.notFound('No follow found');
    return result;
};

/** Quan hệ follow giữa currentUser -> userId (null nếu chưa follow). */
const getRelation = (currentUserId, userId) => followRepository.findOne(currentUserId, userId);

/**
 * Follow / Unfollow.
 * @returns {{ followed: boolean, following: object[] }} danh sách đang follow của currentUser sau khi thay đổi
 */
const toggle = async (currentUserId, followingId) => {
    requireFields({ following_id: followingId }, ['following_id']);
    if (Number(currentUserId) === Number(followingId)) throw AppError.badRequest('You cannot follow yourself');

    const existing = await followRepository.findOne(currentUserId, followingId);
    if (existing) {
        await followRepository.destroy(currentUserId, followingId);
        return { followed: false, following: await followRepository.findByFollower(currentUserId) };
    }

    const target = await userRepository.findById(followingId);
    if (!target) throw AppError.notFound('User not found');

    await followRepository.create(currentUserId, followingId);

    const follower = await userRepository.findById(currentUserId);
    await notificationService.notify({
        userId: followingId,
        type: 'follow',
        message: `${follower ? follower.username : 'Someone'} is now following you.`,
        link: `/user/${currentUserId}`,
    });

    return { followed: true, following: await followRepository.findByFollower(currentUserId) };
};

/** Followers của một hoặc nhiều user. `ids` dạng "1,2,3". */
const getFollowers = (ids, pagination) => {
    if (!ids || typeof ids !== 'string') {
        throw AppError.badRequest("Thiếu hoặc sai định dạng tham số 'ids' (ví dụ: ?ids=1,2,3)");
    }

    const userIds = ids
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => Number.isInteger(id) && id > 0);
    if (userIds.length === 0) throw AppError.badRequest("Tham số 'ids' không hợp lệ");

    return followRepository.findFollowersOf(userIds, pagination);
};

/** Danh sách userId đang follow, kèm cờ isFollow cho biết currentUser có follow họ không. */
const getFollowing = async (userId, currentUserId, pagination) => {
    requireFields({ id: userId }, ['id']);

    const result = await followRepository.findFollowingOf(userId, pagination);
    if (result.total === 0) throw AppError.notFound('You have 0 following');

    const followingIds = result.items.map((item) => item.following.id);
    const followedByCurrent = await followRepository.findFollowedIdsAmong(currentUserId, followingIds);

    const items = result.items.map((item) => {
        const data = item.toJSON();
        return {
            ...data,
            following: { ...data.following, isFollow: followedByCurrent.has(data.following.id) },
        };
    });
    return { items, total: result.total };
};

const countFollowers = (userId) => {
    requireFields({ id: userId }, ['id']);
    return followRepository.countFollowers(userId);
};

const countFollowing = (userId) => {
    requireFields({ id: userId }, ['id']);
    return followRepository.countFollowing(userId);
};

const searchFollowers = (userId, keyword = '', pagination) => {
    requireFields({ id: userId }, ['id']);
    return followRepository.searchFollowersOf(userId, keyword, pagination);
};

const searchFollowing = (userId, keyword = '', pagination) => {
    requireFields({ id: userId }, ['id']);
    return followRepository.searchFollowingOf(userId, keyword, pagination);
};

/**
 * Danh sách followers của userId kèm:
 * - isFollowing: userId có follow lại người đó không
 * - isFollowed : currentUser có follow người đó không
 */
const getFollowerStatusList = async (userId, currentUserId) => {
    requireFields({ user_id: userId }, ['user_id']);

    const { items: followers } = await followRepository.findFollowersOf([Number(userId)], null);
    const followerIds = followers.map((item) => item.follower.id);

    const [followedBackIds, followedByCurrentIds] = await Promise.all([
        followRepository.findFollowedIdsAmong(userId, followerIds),
        followRepository.findFollowedIdsAmong(currentUserId, followerIds),
    ]);

    return followers.map(({ follower }) => ({
        id: follower.id,
        username: follower.username,
        profile_picture: follower.profile_picture,
        isFollowing: followedBackIds.has(follower.id),
        isFollowed: followedByCurrentIds.has(follower.id),
    }));
};

module.exports = {
    getAll,
    getRelation,
    toggle,
    getFollowers,
    getFollowing,
    countFollowers,
    countFollowing,
    searchFollowers,
    searchFollowing,
    getFollowerStatusList,
};
