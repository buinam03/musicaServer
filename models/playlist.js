const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/db');

const Playlist = sequelize.define('Playlist', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    artwork: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    creator_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    isCms: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    idGenre: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'playlists',
    timestamps: false
});

module.exports = Playlist;