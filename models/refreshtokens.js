const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Đảm bảo đường dẫn đúng với nơi cấu hình sequelize

const RefreshToken = sequelize.define('RefreshToken', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    refreshToken: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
}, {
    tableName: 'refreshtokens',
    timestamps: false // Nếu bạn muốn tự động thêm `createdAt` và `updatedAt`, bỏ `timestamps: false`
});

module.exports = RefreshToken;