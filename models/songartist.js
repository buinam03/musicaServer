const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/db');

const SongArtist = sequelize.define('SongArtist', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    song_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    artist_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'song_artists',
    timestamps: false
});

module.exports = SongArtist;