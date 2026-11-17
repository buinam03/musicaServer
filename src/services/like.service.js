const AppError = require('../utils/AppError');
const { requireFields } = require('../utils/validate');
const likeRepository = require('../repositories/like.repository');
const songRepository = require('../repositories/song.repository');
const userRepository = require('../repositories/user.repository');
const notificationService = require('./notification.service');

/**
 * Like / Unlike bài hát.
 * @returns {{ isLiked: boolean }}
 */
const toggle = async ({ userId, songId }) => {
    requireFields({ user_id: userId, song_id: songId }, ['user_id', 'song_id']);

    const existing = await likeRepository.findOne(userId, songId);
    if (existing) {
        await existing.destroy();
        return { isLiked: false };
    }

    const song = await songRepository.findById(songId);
    if (!song) throw AppError.notFound('Song not found');

    await likeRepository.create(userId, songId);

    if (Number(song.uploader_id) !== Number(userId)) {
        const liker = await userRepository.findById(userId);
        await notificationService.notify({
            userId: song.uploader_id,
            type: 'like',
            message: `${liker ? liker.username : 'Someone'} liked your song`,
            link: `/song/${songId}`,
        });
    }

    return { isLiked: true };
};

/** Các bài hát user đã like (dạng rút gọn, kèm isLiked = true). */
const getLikedSongsStatus = async (userId) => {
    requireFields({ user_id: userId }, ['user_id']);

    const songIds = await likeRepository.findSongIdsByUser(userId);
    if (songIds.length === 0) return [];

    const songs = await likeRepository.findSongsBasicByIds(songIds);
    return songs.map((song) => ({ ...song.toJSON(), isLiked: true }));
};

const countBySong = async (songId) => {
    requireFields({ song_id: songId }, ['song_id']);
    return likeRepository.countBySong(songId);
};

const getLikedSongs = async (userId, pagination) => {
    requireFields({ user_id: userId }, ['user_id']);
    return likeRepository.findByUserWithSongs(userId, pagination);
};

module.exports = { toggle, getLikedSongsStatus, countBySong, getLikedSongs };
