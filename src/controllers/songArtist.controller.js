const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { parsePagination } = require('../utils/pagination');
const songArtistService = require('../services/songArtist.service');

const getAllSongArtist = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await songArtistService.getAll(pagination);
    return ApiResponse.list(req, res, result, pagination);
});

module.exports = { getAllSongArtist };
