const notificationRepository = require('../repositories/notification.repository');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');

const TITLES = {
    like: 'Someone liked your post!',
    follow: 'You have a new follower!',
    comment: 'Someone commented on your post!',
};

const getByUser = async (userId, pagination) => {
    const result = await notificationRepository.findByUser(userId, pagination);
    if (result.total === 0) throw AppError.notFound('No notification found');
    return result;
};

/**
 * Tạo thông báo cho user. Đây là side-effect phụ: lỗi chỉ được log,
 * không làm hỏng nghiệp vụ chính (like, follow, ...).
 *
 * @param {{ userId: number, type: 'like'|'follow'|'comment'|'system', message: string, link?: string }} input
 */
const notify = async ({ userId, type, message, link = null }) => {
    try {
        const user = await userRepository.findById(userId);
        if (!user) return null;

        return await notificationRepository.create({
            user_id: userId,
            type,
            title: TITLES[type] || 'System notification',
            message,
            link,
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

module.exports = { getByUser, notify };
