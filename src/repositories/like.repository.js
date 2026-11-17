const { Like, Song, User, SongArtist } = require('../models');
const { findPaged } = require('./helpers');
const { songDetailInclude, songArtistsInclude } = require('./includes');

const findOne = (userId, songId) => Like.findOne({ where: { user_id: userId, song_id: songId } });

const create = (userId, songId) => Like.create({ user_id: userId, song_id: songId });

const countBySong = (songId) => Like.count({ where: { song_id: songId } });

const findSongIdsByUser = async (userId) => {
    const likes = await Like.findAll({ where: { user_id: userId }, attributes: ['song_id'] });
    return likes.map((like) => like.song_id);
};

/** Bài hát (dạng rút gọn) theo danh sách id - dùng cho trạng thái like. */
const findSongsBasicByIds = (songIds) =>
    Song.findAll({
        where: { id: songIds },
        attributes: ['id', 'title', 'is_public'],
        include: [
            {
                model: SongArtist,
                attributes: [],
                include: [{ model: User, attributes: ['id', 'username'] }],
            },
        ],
    });

/** Các lượt like của user kèm thông tin đầy đủ của bài hát. */
const findByUserWithSongs = (userId, pagination) =>
    findPaged(
        Like,
        {
            where: { user_id: userId },
            include: [
                {
                    model: Song,
                    attributes: ['id', 'title', 'artwork', 'is_public', 'path'],
                    include: [{ model: User, attributes: ['id', 'username'] }, songDetailInclude(), songArtistsInclude()],
                },
            ],
            order: [['created_at', 'DESC']],
        },
        pagination,
    );

module.exports = { findOne, create, countBySong, findSongIdsByUser, findSongsBasicByIds, findByUserWithSongs };
