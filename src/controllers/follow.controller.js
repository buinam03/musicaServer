const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { parsePagination } = require('../utils/pagination');
const followService = require('../services/follow.service');

const getAllFollow = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await followService.getAll(pagination);
    return ApiResponse.list(req, res, result, pagination);
});

/** Quan hệ follow của user hiện tại với user :id (data = null nếu chưa follow). */
const getFollowerById = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await followService.getRelation(req.user.id, req.params.id));
});

const addNewFollower = asyncHandler(async (req, res) => {
    const { followed, following } = await followService.toggle(req.user.id, req.body.following_id);
    return followed
        ? ApiResponse.created(res, following, 'Followed successfully')
        : ApiResponse.ok(res, following, 'Unfollowed successfully');
});

const getAllFollower = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await followService.getFollowers(req.query.ids, pagination);
    return ApiResponse.list(req, res, result, pagination);
});

const getAllFollowing = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await followService.getFollowing(req.query.id, req.user.id, pagination);
    return ApiResponse.list(req, res, result, pagination);
});

const getCountFollower = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await followService.countFollowers(req.query.id));
});

const getCountFollowing = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await followService.countFollowing(req.query.id));
});

const searchFollowers = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await followService.searchFollowers(req.query.id, req.query.username, pagination);
    return ApiResponse.list(req, res, result, pagination);
});

const searchFollowing = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await followService.searchFollowing(req.query.id, req.query.username, pagination);
    return ApiResponse.list(req, res, result, pagination);
});

const getFollowStatus = asyncHandler(async (req, res) => {
    const data = await followService.getFollowerStatusList(req.query.user_id, req.user.id);
    return ApiResponse.ok(res, data, 'Get follower list successfully');
});

module.exports = {
    getAllFollow,
    getFollowerById,
    addNewFollower,
    getAllFollower,
    getAllFollowing,
    getCountFollower,
    getCountFollowing,
    searchFollowers,
    searchFollowing,
    getFollowStatus,
};
