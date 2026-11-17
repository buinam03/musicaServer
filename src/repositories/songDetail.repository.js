const { SongDetail } = require('../models');
const { findPaged } = require('./helpers');

const findAll = (pagination) => findPaged(SongDetail, {}, pagination);

const findBySongId = (songId, options = {}) => SongDetail.findOne({ where: { song_id: songId }, ...options });

const create = (data, options = {}) => SongDetail.create(data, options);

const updateBySongId = (songId, data, options = {}) =>
    SongDetail.update(data, { where: { song_id: songId }, ...options });

/** Tăng một bộ đếm (plays/likes) nguyên tử ở DB, tránh race condition. */
const incrementBySongId = (songId, field, by = 1) =>
    SongDetail.increment(field, { by, where: { song_id: songId } });

const destroyBySongId = (songId, options = {}) => SongDetail.destroy({ where: { song_id: songId }, ...options });

module.exports = { findAll, findBySongId, create, updateBySongId, incrementBySongId, destroyBySongId };
