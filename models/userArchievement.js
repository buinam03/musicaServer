const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/db');

const UserAchievement = sequelize.define('UserAchievement', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    achievement_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    achieved_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'user_achievements',
    timestamps: false
});

module.exports = UserAchievement;