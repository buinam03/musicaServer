const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { parsePagination } = require('../utils/pagination');
const songDetailService = require('../services/songDetail.service');
const externalService = require('../services/external.service');

const getAllSongDetail = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await songDetailService.getAll(pagination);
    return ApiResponse.list(req, res, result, pagination);
});

const getGenre = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await externalService.getGenres());
});

const updatePlayWhenListenSong = asyncHandler(async (req, res) => {
    const { detail, counted } = await songDetailService.incrementPlays(req.params.id, req.user?.id);
    return ApiResponse.ok(res, detail, counted ? 'Success' : 'Success (no play count increase - own song)');
});

const updateLikeWhenLikeSong = asyncHandler(async (req, res) => {
    const detail = await songDetailService.incrementLikes(req.params.id, req.user.id);
    return ApiResponse.ok(res, detail);
});

module.exports = { getAllSongDetail, getGenre, updatePlayWhenListenSong, updateLikeWhenLikeSong };
