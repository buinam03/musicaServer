const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { parsePagination } = require('../utils/pagination');
const songService = require('../services/song.service');

const EMPTY_SONGS_MESSAGE = 'There are no songs yet.';

const listByUploader = async (req, res, uploaderId) => {
    const pagination = parsePagination(req.query);
    const result = await songService.listByUploader(uploaderId, pagination);
    return ApiResponse.list(req, res, result, pagination, result.total === 0 ? EMPTY_SONGS_MESSAGE : 'Success');
};

/** GET /getAllSong/:id - bài hát của user :id */
const getAllSong = asyncHandler((req, res) => listByUploader(req, res, req.params.id));

/** GET /getSongByUser - bài hát của user đang đăng nhập */
const getSongByUser = asyncHandler((req, res) => listByUploader(req, res, req.user.id));

const getSongSearch = asyncHandler(async (req, res) => {
    const result = await songService.search(req.query.key);
    const empty = result.songs.length === 0 && result.users.length === 0;
    return ApiResponse.ok(res, result, empty ? 'No results found' : 'Success');
});

const getSongById = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await songService.getById(req.params.id));
});

const getSongByDescPlays = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await songService.getTopByPlays(), 'Top songs by plays');
});

const getSongRandom = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await songService.getRandom(), 'Random songs');
});

const getLastestSong = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await songService.getLatestByUploader(req.params.id));
});

const getDESCSong = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await songService.getRecentShuffled());
});

const getMostListenTrack = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await songService.getMostListenedByUploader(req.params.id));
});

const getSimilarSongs = asyncHandler(async (req, res) => {
    const { song_id: songId, user_id: userId } = req.query;
    return ApiResponse.ok(res, await songService.getSimilar({ songId, userId }));
});

/** GET /getSongPlay?song_id= - lấy bài hát để phát và ghi log nghe */
const getSongPlay = asyncHandler(async (req, res) => {
    const songId = req.query.song_id ?? req.body?.song_id;
    return ApiResponse.ok(res, await songService.play(req.user.id, songId));
});

/** POST /logUser - ghi log user nghe bài hát */
const logUser = asyncHandler(async (req, res) => {
    const log = await songService.logListen(req.user.id, req.body.song_id);
    return ApiResponse.ok(res, log, 'Listen logged');
});

const addNewSong = asyncHandler(async (req, res) => {
    const song = await songService.create(req.user.id, req.body);
    return ApiResponse.created(res, song, 'upload success!');
});

const updateSongById = asyncHandler(async (req, res) => {
    const song = await songService.update(req.params.id, req.body);
    return ApiResponse.ok(res, song, 'Update Song Success');
});

const deleteSongById = asyncHandler(async (req, res) => {
    const result = await songService.remove(req.params.id);
    return ApiResponse.ok(res, result, 'Delete song success!');
});

module.exports = {
    getAllSong,
    getSongByUser,
    getSongSearch,
    getSongById,
    getSongByDescPlays,
    getSongRandom,
    getLastestSong,
    getDESCSong,
    getMostListenTrack,
    getSimilarSongs,
    getSongPlay,
    logUser,
    addNewSong,
    updateSongById,
    deleteSongById,
};
