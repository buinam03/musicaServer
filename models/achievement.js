const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/db');

const Achievement = sequelize.define('Achievement', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    condition_type: {
        type: DataTypes.ENUM('followers', 'songs_uploaded', 'plays', 'likes'),
        allowNull: false
    },
    condition_value: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'achievements',
    timestamps: false
});

module.exports = Achievement;