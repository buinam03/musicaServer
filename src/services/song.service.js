const { sequelize } = require('../config/db');
const AppError = require('../utils/AppError');
const { requireFields, compact } = require('../utils/validate');
const { shuffle, uniqueById } = require('../utils/shuffle');
const songRepository = require('../repositories/song.repository');
const songDetailRepository = require('../repositories/songDetail.repository');
const songArtistRepository = require('../repositories/songArtist.repository');
const listenLogRepository = require('../repositories/listenLog.repository');
const userRepository = require('../repositories/user.repository');
const playlistService = require('./playlist.service');

const TOP_PLAYS_LIMIT = 10;
const RANDOM_LIMIT = 12;
const RECENT_POOL = 10;
const RECENT_RESULT = 7;
const SIMILAR_RANDOM_POOL = 20;
const SIMILAR_RANDOM_RESULT = 15;

// ---------- helpers ----------

const parseGenre = (genre) => {
    if (genre === undefined || genre === null || genre === '') return null;
    const parsed = parseInt(genre, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

/** privacy từ client là 1/0 hoặc '1'/'0' -> boolean is_public. */
const parsePrivacy = (privacy) => {
    if (privacy === undefined || privacy === null || privacy === '') return undefined;
    return privacy === true || privacy === 'true' || Number(privacy) === 1;
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

const hasPlays = (song) => song.SongDetail && song.SongDetail.plays > 0;

// ---------- queries ----------

const listByUploader = async (uploaderId, pagination) => {
    await ensureUser(uploaderId);
    return songRepository.findByUploader(uploaderId, pagination);
};

const search = async (keyword) => {
    if (!keyword || !String(keyword).trim()) return { songs: [], users: [] };
    const key = String(keyword).trim();

    const [songs, users] = await Promise.all([
        songRepository.searchByTitleOrArtist(key),
        userRepository.searchByUsername(key, ['id', 'username', 'profile_picture', 'is_verified']),
    ]);
    return { songs, users };
};

const getById = async (id) => {
    const song = await songRepository.findByIdForDisplay(id);
    if (!song) throw AppError.notFound('Song not found');
    return song;
};

/** Top bài hát nhiều lượt nghe nhất (chỉ lấy bài đã có lượt nghe). */
const getTopByPlays = async () => {
    const songs = await songRepository.findTopByPlays(TOP_PLAYS_LIMIT);
    return songs.filter(hasPlays);
};

const getRandom = () => songRepository.findRandom({ limit: RANDOM_LIMIT });

const getLatestByUploader = (uploaderId) => songRepository.findLatestByUploader(uploaderId, 1);

/** Lấy các bài mới nhất rồi trộn ngẫu nhiên. */
const getRecentShuffled = async () => {
    const songs = await songRepository.findRecent(RECENT_POOL);
    return shuffle(songs).slice(0, RECENT_RESULT);
};

/** Bài hát được nghe nhiều nhất của một uploader (mảng 0 hoặc 1 phần tử). */
const getMostListenedByUploader = async (uploaderId) => {
    const songs = await songRepository.findTopByPlaysOfUploader(uploaderId, 2);
    const sorted = songs.filter(hasPlays).sort((a, b) => b.SongDetail.plays - a.SongDetail.plays);
    return sorted.slice(0, 1);
};

const randomSuggestions = async (excludeId) => {
    const songs = await songRepository.findRandom({ limit: SIMILAR_RANDOM_POOL, excludeId, strict: true });
    return shuffle(songs).slice(0, SIMILAR_RANDOM_RESULT);
};

/**
 * Gợi ý bài hát tương tự dựa vào số lần user đã nghe bài hiện tại:
 * - chưa có song_id / nghe < 2 lần : bài ngẫu nhiên
 * - nghe 2-4 lần                   : bài cùng nghệ sĩ + cùng thể loại
 * - nghe >= 5 lần                  : bài cùng nghệ sĩ + thể loại gần giống (LIKE)
 */
const getSimilar = async ({ songId, userId }) => {
    if (!songId) return randomSuggestions();

    const log = userId ? await listenLogRepository.findOne(userId, songId) : null;
    const listenCount = log ? log.listen_count : 0;
    if (listenCount < 2) return randomSuggestions(songId);

    const current = await songRepository.findWithGenreAndArtists(songId);
    if (!current) throw AppError.notFound('Song not found or has no path');

    const genre = current.SongDetail ? current.SongDetail.genre : null;
    const artistId = current.SongArtists?.[0]?.artist_id ?? null;
    if (!genre || !artistId) throw AppError.notFound('Genre or artist information not found for the song');

    const heavyListener = listenCount >= 5;
    const [byArtist, byGenre] = await Promise.all([
        songRepository.findByArtist({ artistId, excludeId: songId, limit: heavyListener ? 20 : 12 }),
        songRepository.findByGenre({ genre, excludeId: songId, limit: heavyListener ? 5 : 3, fuzzy: heavyListener }),
    ]);

    const combined = uniqueById([...byArtist, ...byGenre]);
    return combined.length > 0 ? shuffle(combined) : randomSuggestions(songId);
};

// ---------- commands ----------

const create = async (uploaderId, { artwork, title, genre, bio, duration, privacy, path }) => {
    requireFields({ title, path, duration }, ['title', 'path', 'duration']);

    const idGenre = parseGenre(genre);
    const isPublic = parsePrivacy(privacy);

    const song = await sequelize.transaction(async (transaction) => {
        const newSong = await songRepository.create(
            compact({ title, artwork, uploader_id: uploaderId, is_public: isPublic, path }),
            { transaction },
        );
        await songDetailRepository.create({ song_id: newSong.id, bio, duration, genre: idGenre }, { transaction });
        await songArtistRepository.create({ song_id: newSong.id, artist_id: uploaderId }, { transaction });
        return newSong;
    });

    await playlistService.syncSongToCmsByGenre(song.id, null, idGenre);
    return songRepository.findByIdWithDetail(song.id);
};

const update = async (songId, { artwork, title, genre, bio, privacy }) => {
    const song = await ensureSong(songId);
    const songDetail = await songDetailRepository.findBySongId(songId);

    const oldGenre = songDetail ? songDetail.genre : null;
    const newGenre = genre !== undefined && genre !== null ? parseGenre(genre) : oldGenre;
    const isPublic = parsePrivacy(privacy);

    await sequelize.transaction(async (transaction) => {
        await songRepository.updateById(
            songId,
            {
                title: title || song.title,
                artwork: artwork || song.artwork,
                is_public: isPublic !== undefined ? isPublic : song.is_public,
            },
            { transaction },
        );

        if (songDetail) {
            await songDetailRepository.updateBySongId(
                songId,
                { bio: bio || songDetail.bio, genre: newGenre },
                { transaction },
            );
        }
    });

    await playlistService.syncSongToCmsByGenre(song.id, oldGenre, newGenre);
    return songRepository.findByIdWithDetail(songId);
};

const remove = async (songId) => {
    await ensureSong(songId);

    await sequelize.transaction(async (transaction) => {
        await songDetailRepository.destroyBySongId(songId, { transaction });
        await songArtistRepository.destroyBySongId(songId, { transaction });
        await songRepository.destroyById(songId, { transaction });
    });

    return { id: Number(songId) };
};

/** Ghi nhận user nghe bài hát. */
const logListen = async (userId, songId) => {
    requireFields({ user_id: userId, song_id: songId }, ['user_id', 'song_id']);
    await ensureSong(songId);
    return listenLogRepository.recordListen(Number(userId), Number(songId));
};

/** Lấy bài hát để phát và ghi log nghe. */
const play = async (userId, songId) => {
    requireFields({ song_id: songId }, ['song_id']);
    const song = await ensureSong(songId);
    await listenLogRepository.recordListen(Number(userId), Number(songId));
    return song;
};

module.exports = {
    listByUploader,
    search,
    getById,
    getTopByPlays,
    getRandom,
    getLatestByUploader,
    getRecentShuffled,
    getMostListenedByUploader,
    getSimilar,
    create,
    update,
    remove,
    logListen,
    play,
};
