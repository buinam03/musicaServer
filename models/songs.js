const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Song = sequelize.define('Song', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    artwork: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    uploader_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_public: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    path: { // Thêm cột path
        type: DataTypes.STRING(500), // Độ dài 500 cho đường dẫn dài hơn nếu cần
        allowNull: false // Đường dẫn là bắt buộc
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'songs',
    timestamps: false
});

module.exports = Song;
