const { Op, literal } = require('sequelize');
const { Song, User, SongDetail, SongArtist } = require('../models');
const { findPaged } = require('./helpers');
const { songCardIncludes, songDetailInclude, songArtistsInclude, userInclude } = require('./includes');

const HAS_PATH = { path: { [Op.ne]: null } };

const findById = (id, options = {}) => Song.findByPk(id, options);

const findByUploader = (uploaderId, pagination) =>
    findPaged(Song, { where: { uploader_id: uploaderId }, include: songCardIncludes() }, pagination);

/** Tìm theo tiêu đề hoặc tên nghệ sĩ. */
const searchByTitleOrArtist = (keyword) =>
    Song.findAll({
        where: {
            [Op.or]: [
                { title: { [Op.like]: `%${keyword}%` } },
                { '$SongArtists.User.username$': { [Op.like]: `%${keyword}%` } },
            ],
        },
        include: [
            songDetailInclude(),
            {
                model: SongArtist,
                attributes: ['id'],
                include: [{ model: User, attributes: ['id', 'username', 'profile_picture', 'is_verified'] }],
            },
        ],
    });

/** Bài hát kèm toàn bộ SongDetail và danh sách artist (dùng sau khi tạo/cập nhật). */
const findByIdWithDetail = (id) =>
    Song.findOne({
        where: { id },
        include: [
            { model: SongDetail },
            { model: SongArtist, include: [{ model: User, attributes: ['username'] }] },
        ],
    });

const findByIdForDisplay = (id) =>
    Song.findOne({
        where: { id },
        include: songCardIncludes({ uploaderAttrs: ['id'] }),
    });

const findTopByPlays = (limit) =>
    Song.findAll({
        where: { ...HAS_PATH, is_public: true },
        include: songCardIncludes(),
        order: [[SongDetail, 'plays', 'DESC']],
        limit,
    });

const findTopByPlaysOfUploader = (uploaderId, limit) =>
    Song.findAll({
        where: { ...HAS_PATH, uploader_id: uploaderId, is_public: true },
        include: songCardIncludes(),
        order: [[SongDetail, 'plays', 'DESC']],
        limit,
    });

/**
 * Lấy ngẫu nhiên các bài hát có file nhạc.
 * @param {{ limit: number, excludeId?: number|string, strict?: boolean }} opts
 *   strict = true: chỉ lấy bài có đủ SongDetail và SongArtist.
 */
const findRandom = ({ limit, excludeId, strict = false }) => {
    const where = { ...HAS_PATH };
    if (excludeId) where.id = { [Op.ne]: excludeId };

    return Song.findAll({
        where,
        include: [
            userInclude(['id', 'username']),
            songDetailInclude(strict ? { required: true } : {}),
            songArtistsInclude(strict ? { required: true } : {}),
        ],
        order: literal('RAND()'),
        limit,
        distinct: true,
    });
};

const findLatestByUploader = (uploaderId, limit) =>
    Song.findAll({
        where: { uploader_id: uploaderId },
        include: songCardIncludes(),
        order: [['created_at', 'DESC']],
        limit,
    });

const findRecent = (limit) => Song.findAll({ order: [['created_at', 'DESC']], limit });

/** Bài hát kèm genre và artist_id (dùng để gợi ý bài tương tự). */
const findWithGenreAndArtists = (id) =>
    Song.findOne({
        where: { id, ...HAS_PATH },
        include: [
            { model: SongDetail, attributes: ['genre'], required: true },
            { model: SongArtist, attributes: ['artist_id'], required: true },
        ],
    });

/** Bài hát của một nghệ sĩ (trừ bài hiện tại). */
const findByArtist = ({ artistId, excludeId, limit }) =>
    Song.findAll({
        where: { ...HAS_PATH, id: { [Op.ne]: excludeId } },
        include: [
            userInclude(['id', 'username']),
            songDetailInclude(),
            songArtistsInclude({ where: { artist_id: artistId }, required: true }),
        ],
        limit,
        distinct: true,
    });

/**
 * Bài hát cùng thể loại (trừ bài hiện tại).
 * fuzzy = true: so khớp genre bằng LIKE (gợi ý "thể loại con").
 */
const findByGenre = ({ genre, excludeId, limit, fuzzy = false }) =>
    Song.findAll({
        where: { ...HAS_PATH },
        include: [
            userInclude(['id', 'username']),
            songDetailInclude({
                where: {
                    genre: fuzzy ? { [Op.like]: `%${genre}%` } : genre,
                    song_id: { [Op.ne]: excludeId },
                },
            }),
            songArtistsInclude(),
        ],
        limit,
        distinct: true,
    });

const create = (data, options = {}) => Song.create(data, options);

const updateById = (id, data, options = {}) => Song.update(data, { where: { id }, ...options });

const destroyById = (id, options = {}) => Song.destroy({ where: { id }, ...options });

module.exports = {
    findById,
    findByUploader,
    searchByTitleOrArtist,
    findByIdWithDetail,
    findByIdForDisplay,
    findTopByPlays,
    findTopByPlaysOfUploader,
    findRandom,
    findLatestByUploader,
    findRecent,
    findWithGenreAndArtists,
    findByArtist,
    findByGenre,
    create,
    updateById,
    destroyById,
};
