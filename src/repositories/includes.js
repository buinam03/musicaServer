/**
 * Các khối include Sequelize dùng lặp lại nhiều nơi.
 * Mỗi hàm trả về object MỚI vì Sequelize có thể mutate options truyền vào.
 */
const { User, SongDetail, SongArtist } = require('../models');

const PUBLIC_USER_ATTRS = ['id', 'username', 'profile_picture'];
const SONG_DETAIL_ATTRS = ['bio', 'duration', 'genre', 'likes', 'plays'];

const userInclude = (attributes = PUBLIC_USER_ATTRS, extra = {}) => ({
    model: User,
    attributes,
    ...extra,
});

const songDetailInclude = (extra = {}) => ({
    model: SongDetail,
    attributes: SONG_DETAIL_ATTRS,
    ...extra,
});

const songArtistsInclude = (extra = {}) => ({
    model: SongArtist,
    attributes: [],
    include: [{ model: User, attributes: ['username'] }],
    ...extra,
});

/** Bộ include chuẩn cho "card bài hát": uploader + detail + artists. */
const songCardIncludes = ({ uploaderAttrs = ['id', 'username'] } = {}) => [
    userInclude(uploaderAttrs),
    songDetailInclude(),
    songArtistsInclude(),
];

module.exports = {
    PUBLIC_USER_ATTRS,
    SONG_DETAIL_ATTRS,
    userInclude,
    songDetailInclude,
    songArtistsInclude,
    songCardIncludes,
};
