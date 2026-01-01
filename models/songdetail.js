const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/db');

const SongDetail = sequelize.define('SongDetail', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    song_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    genre: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    plays: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'songs_detail',
    timestamps: false
});

module.exports = SongDetail;