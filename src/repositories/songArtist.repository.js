const { SongArtist } = require('../models');
const { findPaged } = require('./helpers');

const findAll = (pagination) => findPaged(SongArtist, {}, pagination);

const create = (data, options = {}) => SongArtist.create(data, options);

const destroyBySongId = (songId, options = {}) => SongArtist.destroy({ where: { song_id: songId }, ...options });

module.exports = { findAll, create, destroyBySongId };
