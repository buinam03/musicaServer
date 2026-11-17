const AppError = require('../utils/AppError');
const songRepository = require('../repositories/song.repository');
const songDetailRepository = require('../repositories/songDetail.repository');
const notificationService = require('./notification.service');

const getAll = async (pagination) => {
    const result = await songDetailRepository.findAll(pagination);
    if (result.total === 0) throw AppError.notFound('No song detail found');
    return result;
};

const ensureSongWithDetail = async (songId) => {
    const song = await songRepository.findById(songId);
    if (!song) throw AppError.notFound('Song not found');

    const detail = await songDetailRepository.findBySongId(songId);
    if (!detail) throw AppError.notFound('Song detail not found');

    return { song, detail };
};

/**
 * Tăng lượt nghe. Không tăng khi người nghe chính là người upload.
 * @returns {{ detail: object, counted: boolean }}
 */
const incrementPlays = async (songId, listenerId) => {
    const { song, detail } = await ensureSongWithDetail(songId);

    if (listenerId && Number(listenerId) === Number(song.uploader_id)) {
        return { detail, counted: false };
    }

    await songDetailRepository.incrementBySongId(songId, 'plays');
    return { detail: await songDetailRepository.findBySongId(songId), counted: true };
};

/** Tăng lượt thích và thông báo cho người upload. */
const incrementLikes = async (songId, actorId) => {
    const { song } = await ensureSongWithDetail(songId);

    await songDetailRepository.incrementBySongId(songId, 'likes');

    if (Number(actorId) !== Number(song.uploader_id)) {
        await notificationService.notify({
            userId: song.uploader_id,
            type: 'like',
            message: 'Người dùng đã thích bài viết của bạn',
            link: `/song/${songId}`,
        });
    }

    return songDetailRepository.findBySongId(songId);
};

module.exports = { getAll, incrementPlays, incrementLikes };
