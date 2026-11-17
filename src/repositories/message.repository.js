const { Op, fn, col, literal } = require('sequelize');
const { Message } = require('../models');
const { findPaged } = require('./helpers');
const { userInclude } = require('./includes');

const senderInclude = () => userInclude(undefined, { as: 'sender' });
const receiverInclude = () => userInclude(undefined, { as: 'receiver' });

const findAll = (pagination) => findPaged(Message, {}, pagination);

const findById = (id) => Message.findByPk(id);

const create = (data) => Message.create(data);

const destroyById = (id) => Message.destroy({ where: { id } });

/** Tin nhắn một chiều từ senderId tới receiverId. */
const findBetween = (senderId, receiverId) =>
    Message.findAll({
        where: { send_id: senderId, receive_id: receiverId },
        include: [senderInclude()],
        order: [['created_at', 'ASC']],
    });

const findByRoom = (roomId, pagination) =>
    findPaged(
        Message,
        {
            where: {
                room_id: roomId,
                send_id: { [Op.ne]: col('receive_id') },
            },
            include: [senderInclude(), receiverInclude()],
            order: [['created_at', 'ASC']],
        },
        pagination,
    );

const findFirstSentBy = (userId) =>
    Message.findOne({ where: { send_id: userId }, order: [['created_at', 'ASC']] });

/** Danh sách phòng chat của user kèm tin nhắn mới nhất (raw + nest). */
const findRoomsOfUser = (userId) =>
    Message.findAll({
        attributes: [
            [fn('DISTINCT', col('room_id')), 'room_id'],
            'receive_id',
            [
                literal(`(
                    SELECT message FROM messages AS m
                    WHERE m.room_id = Message.room_id
                    ORDER BY m.created_at DESC LIMIT 1
                )`),
                'latest_message',
            ],
            [
                literal(`(
                    SELECT created_at FROM messages AS m
                    WHERE m.room_id = Message.room_id
                    ORDER BY m.created_at DESC LIMIT 1
                )`),
                'latest_message_time',
            ],
        ],
        where: {
            room_id: { [Op.ne]: null },
            [Op.or]: [{ send_id: userId }, { receive_id: userId }],
        },
        include: [senderInclude(), receiverInclude()],
        order: [[literal('latest_message_time'), 'DESC']],
        raw: true,
        nest: true,
    });

module.exports = { findAll, findById, create, destroyById, findBetween, findByRoom, findFirstSentBy, findRoomsOfUser };
