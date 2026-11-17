const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { parsePagination } = require('../utils/pagination');
const playlistService = require('../services/playlist.service');

const getAllPlaylist = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await playlistService.getAll(pagination);
    return ApiResponse.list(req, res, result, pagination);
});

const getPlaylistById = asyncHandler(async (req, res) => {
    return ApiResponse.ok(res, await playlistService.getDetail(req.params.playlist_id));
});

const getPlaylistsByUserId = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await playlistService.getByCreator(req.params.user_id, pagination);
    return ApiResponse.list(req, res, result, pagination);
});

const getPlaylistCMS = asyncHandler(async (req, res) => {
    const playlists = await playlistService.getCmsShuffled();
    return ApiResponse.ok(res, playlists, playlists.length === 0 ? 'No playlist found' : 'Success');
});

const getAllPlaylistCMS = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await playlistService.getAllCms(pagination);
    return ApiResponse.list(req, res, result, pagination);
});

const createNewPlaylist = asyncHandler(async (req, res) => {
    const playlist = await playlistService.create(req.body);
    return ApiResponse.created(res, playlist, 'Playlist created successfully');
});

const createNewPlaylistNotName = asyncHandler(async (req, res) => {
    const playlist = await playlistService.addSongOrCreateAuto(req.body);
    return ApiResponse.created(res, playlist, 'Song added to playlist successfully');
});

const addSongToPlaylist = asyncHandler(async (req, res) => {
    const playlist = await playlistService.addSong(req.body);
    return ApiResponse.created(res, playlist, 'Song added to playlist successfully');
});

const removeSongFromPlaylist = asyncHandler(async (req, res) => {
    const playlist = await playlistService.removeSong(req.body);
    return ApiResponse.ok(res, playlist, 'Song removed from playlist successfully');
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const playlist = await playlistService.update(req.params.playlist_id, req.body);
    return ApiResponse.ok(res, playlist, 'Playlist updated successfully');
});

const deletePlaylist = asyncHandler(async (req, res) => {
    await playlistService.remove(req.params.playlist_id);
    return ApiResponse.ok(res, null, 'Playlist deleted successfully');
});

const createPlaylistCMS = asyncHandler(async (req, res) => {
    const playlist = await playlistService.createCms(req.body);
    return ApiResponse.created(res, playlist, 'Playlist created successfully');
});

const addSongToPlaylistCMS = asyncHandler(async (req, res) => {
    await playlistService.addSongToCms(req.body);
    return ApiResponse.created(res, null, 'Song added to playlist successfully');
});

module.exports = {
    getAllPlaylist,
    getPlaylistById,
    getPlaylistsByUserId,
    getPlaylistCMS,
    getAllPlaylistCMS,
    createNewPlaylist,
    createNewPlaylistNotName,
    addSongToPlaylist,
    removeSongFromPlaylist,
    updatePlaylist,
    deletePlaylist,
    createPlaylistCMS,
    addSongToPlaylistCMS,
};
