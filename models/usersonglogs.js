const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserSongLog = sequelize.define('UserSongLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Tên bảng trong cơ sở dữ liệu
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
    listen_count: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    last_listened_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'user_song_logs',
    timestamps: false,
});

module.exports = UserSongLog;
