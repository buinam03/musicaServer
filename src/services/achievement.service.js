const AppError = require('../utils/AppError');
const { requireFields } = require('../utils/validate');
const achievementRepository = require('../repositories/achievement.repository');
const userRepository = require('../repositories/user.repository');

const REQUIRED_ACHIEVEMENT_COUNT = 4;

// ---------- Achievement ----------

const getAll = async (pagination) => {
    const result = await achievementRepository.findAll(pagination);
    if (result.total === 0) throw AppError.notFound('No Achievement found');
    return result;
};

const create = ({ name, description, condition_type: conditionType, condition_value: conditionValue }) => {
    requireFields({ name, description, condition_type: conditionType, condition_value: conditionValue }, [
        'name',
        'description',
        'condition_type',
        'condition_value',
    ]);
    return achievementRepository.create({
        name,
        description,
        condition_type: conditionType,
        condition_value: conditionValue,
    });
};

// ---------- UserAchievement ----------

const ensureUser = async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found');
    return user;
};

const getByUser = async (userId, pagination) => {
    requireFields({ userId }, ['userId']);
    await ensureUser(userId);

    const result = await achievementRepository.findByUser(userId, pagination);
    if (result.total === 0) throw AppError.notFound('No userarchievement found');
    return result;
};

/** Lưu đúng 4 achievement được user chọn (tạo mới hoặc cập nhật achieved_at). */
const saveForUser = async ({ userId, achievementId: achievementIds }) => {
    requireFields({ userId, achievementId: achievementIds }, ['userId', 'achievementId']);
    if (!Array.isArray(achievementIds) || achievementIds.length !== REQUIRED_ACHIEVEMENT_COUNT) {
        throw AppError.badRequest(
            `Invalid input. Must provide exactly ${REQUIRED_ACHIEVEMENT_COUNT} achievementIds as an array.`,
        );
    }

    await ensureUser(userId);

    const found = await achievementRepository.findByIds(achievementIds);
    if (found.length !== new Set(achievementIds).size) {
        const foundIds = found.map((a) => a.id);
        const invalidIds = achievementIds.filter((id) => !foundIds.includes(Number(id)));
        throw AppError.badRequest('Some achievement IDs do not exist', { invalidAchievementIds: invalidIds });
    }

    const results = [];
    for (const achievementId of achievementIds) {
        const { record, created } = await achievementRepository.upsertUserAchievement(userId, achievementId);
        results.push({ achievement_id: achievementId, action: created ? 'created' : 'updated', data: record });
    }
    return results;
};

module.exports = { getAll, create, getByUser, saveForUser };
