const AppError = require('../utils/AppError');
const { requireFields } = require('../utils/validate');
const commentRepository = require('../repositories/comment.repository');
const songRepository = require('../repositories/song.repository');
const userRepository = require('../repositories/user.repository');

/** Chỉ cho phép ASC/DESC để tránh truyền giá trị tuỳ ý vào ORDER BY. */
const normalizeOrder = (order) => (String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC');

const getBySong = async (songId, order, pagination) => {
    const result = await commentRepository.findBySong(songId, normalizeOrder(order), pagination);
    if (result.total === 0) throw AppError.notFound('No comment found');
    return result;
};

const addToSong = async (songId, { user_id: userId, content, parent_id: parentId }) => {
    requireFields({ user_id: userId, content }, ['user_id', 'content']);

    const [song, user] = await Promise.all([songRepository.findById(songId), userRepository.findById(userId)]);
    if (!user) throw AppError.notFound('User not found!');
    if (!song) throw AppError.notFound('Song not found!');

    const comment = await commentRepository.create({
        song_id: songId,
        user_id: userId,
        content,
        parent_id: parentId || null,
    });
    return commentRepository.findByIdWithUser(comment.id);
};

module.exports = { getBySong, addToSong };
