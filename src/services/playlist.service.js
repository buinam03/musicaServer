const { sequelize } = require('../config/db');
const AppError = require('../utils/AppError');
const { requireFields, compact } = require('../utils/validate');
const { shuffle } = require('../utils/shuffle');
const playlistRepository = require('../repositories/playlist.repository');
const songRepository = require('../repositories/song.repository');
const userRepository = require('../repositories/user.repository');

// ---------- helpers ----------

const ensurePlaylist = async (id, where = {}) => {
    const playlist = await playlistRepository.findOne({ id, ...where });
    if (!playlist) throw AppError.notFound('Playlist not found');
    return playlist;
};

const ensureSong = async (id) => {
    const song = await songRepository.findById(id);
    if (!song) throw AppError.notFound('Song not found');
    return song;
};

const ensureUser = async (id) => {
    const user = await userRepository.findById(id);
    if (!user) throw AppError.notFound('User not found');
    return user;
};

const ensureSongNotInPlaylist = async (playlistId, songId) => {
    const existing = await playlistRepository.findPlaylistSong(playlistId, songId);
    if (existing) throw AppError.badRequest('Song is already in the playlist');
};

/** Tên tự động: "Playlist <username>" hoặc "Playlist <username> #<n+1>". */
const buildAutoPlaylistName = async (user) => {
    const existing = await playlistRepository.findAutoNamedByCreator(user.id, user.username);
    if (existing.length === 0) return `Playlist ${user.username}`;

    const maxNumber = Math.max(
        ...existing.map((p) => {
            const match = p.name.match(/#(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
        }),
    );
    return `Playlist ${user.username} #${maxNumber + 1}`;
};

// ---------- queries ----------

const getAll = async (pagination) => {
    const result = await playlistRepository.findAllWithSongs(pagination);
    if (result.total === 0) throw AppError.notFound('No playlist found');
    return result;
};

const getDetail = async (playlistId) => {
    const playlist = await playlistRepository.findDetailById(playlistId);
    if (!playlist) throw AppError.notFound('Playlist not found');
    return playlist;
};

const getByCreator = (userId, pagination) => playlistRepository.findByCreator(userId, pagination);

/** Playlist CMS theo thứ tự ngẫu nhiên. */
const getCmsShuffled = async () => {
    const { items } = await playlistRepository.findCms(null);
    return shuffle(items);
};

const getAllCms = (pagination) => playlistRepository.findCms(pagination);

// ---------- commands ----------

const create = async ({ name, artwork, creator_id: creatorId }) => {
    requireFields({ name, creator_id: creatorId }, ['name', 'creator_id']);
    await ensureUser(creatorId);

    const playlist = await playlistRepository.create({
        name: String(name).trim(),
        artwork: artwork || null,
        creator_id: creatorId,
    });
    return playlistRepository.findWithCreatorById(playlist.id);
};

/**
 * Thêm bài hát vào playlist có sẵn (playlist_id) hoặc
 * tạo playlist mới với tên tự động rồi thêm bài hát vào.
 */
const addSongOrCreateAuto = async ({ playlist_id: playlistId, song_id: songId, user_id: userId }) => {
    requireFields({ song_id: songId, user_id: userId }, ['song_id', 'user_id']);

    const user = await ensureUser(userId);
    await ensureSong(songId);

    let playlist;
    if (!playlistId) {
        playlist = await playlistRepository.create({
            name: await buildAutoPlaylistName(user),
            artwork: null,
            creator_id: user.id,
        });
    } else {
        playlist = await ensurePlaylist(playlistId);
        if (Number(playlist.creator_id) !== Number(userId)) {
            throw AppError.forbidden("You don't have permission to modify this playlist");
        }
    }

    await ensureSongNotInPlaylist(playlist.id, songId);
    await playlistRepository.addSong(playlist.id, songId);

    return playlistRepository.findSummaryById(playlist.id);
};

const addSong = async ({ playlist_id: playlistId, song_id: songId }) => {
    requireFields({ playlist_id: playlistId, song_id: songId }, ['playlist_id', 'song_id']);

    await ensurePlaylist(playlistId);
    await ensureSong(songId);
    await ensureSongNotInPlaylist(playlistId, songId);
    await playlistRepository.addSong(playlistId, songId);

    return playlistRepository.findSummaryById(playlistId, { withCreator: false, throughAttrs: ['created_at'] });
};

const removeSong = async ({ playlist_id: playlistId, song_id: songId }) => {
    requireFields({ playlist_id: playlistId, song_id: songId }, ['playlist_id', 'song_id']);

    const existing = await playlistRepository.findPlaylistSong(playlistId, songId);
    if (!existing) throw AppError.notFound('Song not found in playlist');

    await playlistRepository.removeSong(playlistId, songId);
    return playlistRepository.findSummaryById(playlistId, { withCreator: false });
};

const update = async (playlistId, { name, artwork }) => {
    await ensurePlaylist(playlistId);

    await playlistRepository.updateById(
        playlistId,
        compact({
            name: name !== undefined && name !== null ? String(name).trim() : undefined,
            artwork,
            updated_at: new Date(),
        }),
    );
    return playlistRepository.findSummaryById(playlistId);
};

const remove = async (playlistId) => {
    await ensurePlaylist(playlistId);

    await sequelize.transaction(async (transaction) => {
        await playlistRepository.removeAllSongs(playlistId, { transaction });
        await playlistRepository.destroyById(playlistId, { transaction });
    });
};

// ---------- CMS playlists ----------

const createCms = async ({ name, artwork, idGenre }) => {
    requireFields({ name }, ['name']);
    return playlistRepository.create({
        name: String(name).trim(),
        artwork: artwork || null,
        isCms: true,
        idGenre: idGenre !== undefined && idGenre !== null && idGenre !== '' ? Number(idGenre) : null,
    });
};

const addSongToCms = async ({ playlist_id: playlistId, song_id: songId }) => {
    requireFields({ playlist_id: playlistId, song_id: songId }, ['playlist_id', 'song_id']);

    await ensurePlaylist(playlistId, { isCms: true });
    await ensureSong(songId);
    await ensureSongNotInPlaylist(playlistId, songId);
    await playlistRepository.addSong(playlistId, songId);
};

/**
 * Đồng bộ bài hát vào playlist CMS theo thể loại khi genre thay đổi.
 * Là side-effect phụ: lỗi chỉ được log, không làm hỏng việc tạo/cập nhật bài hát.
 */
const syncSongToCmsByGenre = async (songId, oldGenre, newGenre) => {
    if (oldGenre === newGenre) return;

    try {
        if (oldGenre) {
            const oldPlaylist = await playlistRepository.findCmsByGenre(oldGenre);
            if (oldPlaylist) await playlistRepository.removeSong(oldPlaylist.id, songId);
        }

        if (newGenre) {
            const newPlaylist = await playlistRepository.findCmsByGenre(newGenre);
            if (newPlaylist && !(await playlistRepository.findPlaylistSong(newPlaylist.id, songId))) {
                await playlistRepository.addSong(newPlaylist.id, songId);
            }
        }
    } catch (error) {
        console.error(`Error syncing song ${songId} to CMS playlist (genre ${oldGenre} -> ${newGenre}):`, error);
    }
};

module.exports = {
    getAll,
    getDetail,
    getByCreator,
    getCmsShuffled,
    getAllCms,
    create,
    addSongOrCreateAuto,
    addSong,
    removeSong,
    update,
    remove,
    createCms,
    addSongToCms,
    syncSongToCmsByGenre,
};
