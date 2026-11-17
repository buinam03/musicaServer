const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PlaylistSong = sequelize.define('PlaylistSong', {
    playlist_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'playlists', // Tên bảng trong cơ sở dữ liệu
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    song_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'songs', // Tên bảng trong cơ sở dữ liệu
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'playlist_song',
    timestamps: false,
});

module.exports = PlaylistSong;