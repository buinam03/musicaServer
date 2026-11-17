const { Op } = require('sequelize');
const { Playlist, PlaylistSong, Song } = require('../models');
const { findPaged } = require('./helpers');
const { userInclude } = require('./includes');

const creatorInclude = () => userInclude(undefined, { as: 'creator' });

const songsSummaryInclude = (throughAttrs = []) => ({
    model: Song,
    through: { attributes: throughAttrs },
    attributes: ['id', 'title', 'artwork'],
});

// ---------- Playlist ----------

const findById = (id) => Playlist.findByPk(id);

const findOne = (where) => Playlist.findOne({ where });

const findAllWithSongs = (pagination) =>
    findPaged(
        Playlist,
        {
            include: [creatorInclude(), songsSummaryInclude()],
            order: [['created_at', 'DESC']],
        },
        pagination,
    );

/** Chi tiết playlist: creator + bài hát (kèm uploader của từng bài). */
const findDetailById = (id) =>
    Playlist.findOne({
        where: { id },
        include: [
            creatorInclude(),
            {
                model: Song,
                through: { attributes: ['created_at'] },
                attributes: ['id', 'title', 'artwork', 'path', 'uploader_id'],
                include: [userInclude()],
            },
        ],
    });

/** Playlist kèm creator và tóm tắt bài hát (dùng làm response sau khi thay đổi). */
const findSummaryById = (id, { withCreator = true, throughAttrs = [] } = {}) =>
    Playlist.findOne({
        where: { id },
        include: [...(withCreator ? [creatorInclude()] : []), songsSummaryInclude(throughAttrs)],
    });

const findWithCreatorById = (id) => Playlist.findOne({ where: { id }, include: [creatorInclude()] });

const findByCreator = (creatorId, pagination) =>
    findPaged(
        Playlist,
        {
            where: { creator_id: creatorId },
            include: [creatorInclude(), { model: Song }],
            order: [['created_at', 'DESC']],
        },
        pagination,
    );

/** Tên các playlist tự đặt dạng "Playlist <username> #<n>" của user. */
const findAutoNamedByCreator = (creatorId, username) =>
    Playlist.findAll({
        where: {
            creator_id: creatorId,
            name: { [Op.like]: `Playlist ${username} #%` },
        },
        attributes: ['id', 'name'],
    });

const findCms = (pagination) => findPaged(Playlist, { where: { isCms: true } }, pagination);

const findCmsByGenre = (idGenre) => Playlist.findOne({ where: { isCms: true, idGenre } });

const create = (data, options = {}) => Playlist.create(data, options);

const updateById = (id, data) => Playlist.update(data, { where: { id } });

const destroyById = (id, options = {}) => Playlist.destroy({ where: { id }, ...options });

// ---------- PlaylistSong ----------

const findPlaylistSong = (playlistId, songId) =>
    PlaylistSong.findOne({ where: { playlist_id: playlistId, song_id: songId } });

const addSong = (playlistId, songId) => PlaylistSong.create({ playlist_id: playlistId, song_id: songId });

const removeSong = (playlistId, songId) =>
    PlaylistSong.destroy({ where: { playlist_id: playlistId, song_id: songId } });

const removeAllSongs = (playlistId, options = {}) =>
    PlaylistSong.destroy({ where: { playlist_id: playlistId }, ...options });

module.exports = {
    findById,
    findOne,
    findAllWithSongs,
    findDetailById,
    findSummaryById,
    findWithCreatorById,
    findByCreator,
    findAutoNamedByCreator,
    findCms,
    findCmsByGenre,
    create,
    updateById,
    destroyById,
    findPlaylistSong,
    addSong,
    removeSong,
    removeAllSongs,
};
