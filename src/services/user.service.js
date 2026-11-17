const AppError = require('../utils/AppError');
const { compact } = require('../utils/validate');
const userRepository = require('../repositories/user.repository');

const RANDOM_USER_LIMIT = 12;

/** Chuẩn hoá đường dẫn ảnh cũ dạng "@/image/..." thành "/images/...". */
const normalizeProfilePicture = (user) => {
    if (user.profile_picture && user.profile_picture.startsWith('@/image')) {
        user.profile_picture = '/images' + user.profile_picture.replace('@/image', '');
    }
    return user;
};

const getAll = async (pagination) => {
    const result = await userRepository.findAll(pagination);
    if (result.total === 0) throw AppError.notFound('No users found');
    return result;
};

const getById = async (id) => {
    const user = await userRepository.findById(id);
    if (!user) throw AppError.notFound('User not found');
    return user;
};

const getCurrent = async (userId) => normalizeProfilePicture(await getById(userId));

/** User ngẫu nhiên (trừ bản thân) kèm số follower của từng người. */
const getRandom = async (currentUserId) => {
    const users = await userRepository.findRandomExcept(currentUserId, RANDOM_USER_LIMIT);
    const followerCounts = await userRepository.countFollowersByUserIds(users.map((u) => u.id));

    return users.map((user) => ({
        ...user.toJSON(),
        followerCount: followerCounts.get(user.id) || 0,
    }));
};

const updateAndReturn = async (userId, data) => {
    await userRepository.updateById(userId, compact(data));
    return getById(userId);
};

const updateProfilePicture = (userId, profilePicture) =>
    updateAndReturn(userId, { profile_picture: profilePicture });

const updateHeaderPicture = (userId, headerPicture) => updateAndReturn(userId, { header_picture: headerPicture });

const updateInfo = (userId, { username, province, country, bio }) =>
    updateAndReturn(userId, { username, province, country, bio, updated_at: new Date() });

module.exports = {
    getAll,
    getById,
    getCurrent,
    getRandom,
    updateProfilePicture,
    updateHeaderPicture,
    updateInfo,
};
