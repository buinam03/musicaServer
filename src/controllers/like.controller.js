const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { parsePagination } = require('../utils/pagination');
const likeService = require('../services/like.service');

const toggleLike = asyncHandler(async (req, res) => {
    const { user_id: userId, song_id: songId } = req.body;
    const result = await likeService.toggle({ userId, songId });
    return ApiResponse.ok(res, result, result.isLiked ? 'Song liked successfully' : 'Song unliked successfully');
});

const getLikeStatus = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await likeService.getLikedSongsStatus(req.query.user_id));
});

/** GET /getSongLikes?song_id= */
const getSongLikes = asyncHandler(async (req, res) => {
    const songId = req.query.song_id ?? req.params.song_id;
    const likes = await likeService.countBySong(songId);
    return ApiResponse.ok(res, { song_id: Number(songId), likes });
});

/** Dùng chung cho /getAllSongLiked và /getSongLikeById (cùng chức năng). */
const getLikedSongs = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await likeService.getLikedSongs(req.query.user_id, pagination);
    return ApiResponse.list(req, res, result, pagination);
});

module.exports = { toggleLike, getLikeStatus, getSongLikes, getLikedSongs };
