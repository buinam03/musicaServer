const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/db');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    send_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    receive_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    room_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'messages',
    timestamps: false
});

module.exports = Message;