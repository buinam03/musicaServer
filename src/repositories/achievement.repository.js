const { Achievement, UserAchievement, User } = require('../models');
const { findPaged } = require('./helpers');

// ---------- Achievement ----------

const findAll = (pagination) => findPaged(Achievement, {}, pagination);

const findByIds = (ids) => Achievement.findAll({ where: { id: ids } });

const create = (data) => Achievement.create(data);

// ---------- UserAchievement ----------

const findByUser = (userId, pagination) =>
    findPaged(
        UserAchievement,
        {
            where: { userId },
            include: [{ model: User, attributes: ['username'] }],
        },
        pagination,
    );

/** Tạo mới hoặc cập nhật achieved_at. Trả về { record, created }. */
const upsertUserAchievement = async (userId, achievementId) => {
    const now = new Date();
    const [record, created] = await UserAchievement.findOrCreate({
        where: { userId, achievement_id: achievementId },
        defaults: { userId, achievement_id: achievementId, achieved_at: now },
    });

    if (!created) {
        record.achieved_at = now;
        await record.save();
    }
    return { record, created };
};

module.exports = { findAll, findByIds, create, findByUser, upsertUserAchievement };
