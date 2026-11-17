const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { parsePagination } = require('../utils/pagination');
const commentService = require('../services/comment.service');

/** GET /getAllComment/:id?time=ASC|DESC */
const getAllComment = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await commentService.getBySong(req.params.id, req.query.time, pagination);
    return ApiResponse.list(req, res, result, pagination);
});

const addNewCommentToSong = asyncHandler(async (req, res) => {
    const comment = await commentService.addToSong(req.params.id, req.body);
    return ApiResponse.created(res, comment, 'Comment Success');
});

module.exports = { getAllComment, addNewCommentToSong };
