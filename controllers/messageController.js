const { Message, User } = require('../models/relationships');
const { Sequelize } = require('sequelize');
const getRoomId = require('../utils/getRoomId');
const { Op, fn, col, literal } = Sequelize;

const getAllMessage = async (req, res) => {
    try {
        const message = await Message.findAll();
        if (message.length === 0) {
            return res.status(404).json({ message: 'No message found' });
        }
        res.json(message)
    } catch (error) {
        res.status(500).json({ message: 'Error when get message' });
    }
}

//thu 2

// const sendMessage = async (req, res) => {

//     try {
//         const send_id = req.user.id;
//         const { room_id, message } = req.body;

//         const [idA,idB] = room_id.split('_').map(id => Number(id));

//          const receive_id = (idA === send_id) ? idB : idA;

//         // Tạo tin nhắn mới
//         const newMessage = await Message.create({
//             send_id,
//             receive_id,
//             room_id,
//             message,
//         });

//         res.status(201).json({
//             message: "Message sent successfully.",
//             data: newMessage,
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "An error occurred while sending the message." });
//     }
// };

const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { room_id: rawRoomId, message } = req.body;

        // Tách và xác định partner ID qua getRoomId
        const roomId = getRoomId(...rawRoomId.split('_'));
        if (!roomId) {
            return res.status(400).json({ error: 'Cannot send to yourself.' });
        }

        // Tách ra send & receive chính xác
        const [idA, idB] = roomId.split('_').map(Number);
        const receiveId = (idA === senderId) ? idB : idA;

        const newMsg = await Message.create({
            room_id: roomId,
            send_id: senderId,
            receive_id: receiveId,
            message
        });

        return res.status(201).json({ message: 'Sent', data: newMsg });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};

const getMessage = async (req, res) => {
    const send_id = req.user.id;
    const { receive_id } = req.body;
    try {
        const result = await Message.findAll({
            where: { send_id: send_id, receive_id: receive_id },
            include: {
                model: User,
                attributes: ['username', 'profile_picture']
            }
        })

        res.status(200).json({
            message: "get Message successfully.",
            data: result,
        });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while get the message.", error: error });
    }
}

const deleteMessage = async (req, res) => {
    try {
        const { id } = req.body;

        const deleted = await Message.destroy({ where: { id } });

        if (!deleted) {
            return res.status(404).json({ error: "Message not found." });
        }

        res.status(200).json({ message: "Message deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while deleting the message." });
    }
};

const getRoomMessage = async (req, res) => {
    try {
        const roomId = req.params.roomId;

        const [a, b] = roomId.split('_');
        if (a === b) {
            return res.status(400).json({ error: 'Error when open room' });
        }

        const messages = await Message.findAll({
            where: {
                room_id: roomId,
                send_id: { [Op.ne]: col('receive_id') }
            },
            order: [['created_at', 'ASC']],
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username', 'profile_picture']
                },
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'username', 'profile_picture']
                }
            ]
        });

        res.status(200).json({ message: 'Success', data: messages });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while get the room.", error: error });
    }
}

const getASCRoom = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await Message.findOne({
            where: {
                send_id: userId,
            },
            order: [['created_at', 'ASC']],
            limit: 1
        })

        res.status(200).json({ message: 'Success', data: result });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while get the room.", error: error });
    }
}

// const getAllRoomsByUser = async (req, res) => {
//     try {
//         // Lấy `userId` từ thông tin của người dùng đăng nhập (token hoặc session)
//         const userId = req.user.id;

//         // Truy vấn lấy các `room_id` liên quan đến `userId`
//         const rooms = await Message.findAll({
//             attributes: [
//                 [Sequelize.fn('DISTINCT', Sequelize.col('room_id')), 'room_id'],
//                 'receive_id',
//                 [Sequelize.literal('(SELECT message FROM messages AS m WHERE m.room_id = Message.room_id ORDER BY m.created_at DESC LIMIT 1)'), 'latest_message'],
//                 [Sequelize.literal('(SELECT created_at FROM messages AS m WHERE m.room_id = Message.room_id ORDER BY m.created_at DESC LIMIT 1)'), 'latest_message_time']
//             ],
//             where: {
//                 room_id: { [Op.ne]: null },
//                 [Op.or]: [
//                     { send_id: userId },
//                     { receive_id: userId }
//                 ]
//             },
//             include: {
//                 model: User,
//                 attributes: ['profile_picture', 'username']
//             },
//             raw: true, // Trả về dữ liệu plain object
//         });

//         if (rooms.length === 0) {
//             return res.status(200).json({
//                 message: "There are no rooms in this message yet.",
//                 data: []
//             });
//         }

//         res.status(200).json({ message: 'Success', data: rooms });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred while fetching rooms for the user.' });
//     }
// };

const getAllRoomsByUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const rooms = await Message.findAll({
            attributes: [
                [fn('DISTINCT', col('room_id')), 'room_id'],
                'receive_id',
                [literal(`(
           SELECT message 
           FROM messages AS m 
           WHERE m.room_id = Message.room_id 
           ORDER BY m.created_at DESC 
           LIMIT 1
         )`), 'latest_message'],
                [literal(`(
           SELECT created_at 
           FROM messages AS m 
           WHERE m.room_id = Message.room_id 
           ORDER BY m.created_at DESC 
           LIMIT 1
         )`), 'latest_message_time'],
            ],
            where: {
                room_id: { [Op.ne]: null },
                [Op.or]: [
                    { send_id: userId },
                    { receive_id: userId }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username', 'profile_picture']
                },
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'username', 'profile_picture']
                }
            ],
            order: [[literal('latest_message_time'), 'DESC']],
            raw: true,
            nest: true
        });

        const data = rooms.map(r => {
            // r.sender và r.receiver là object
            const partner = (r.sender.id === userId)
                ? r.receiver
                : r.sender;
            return {
                room_id: r.room_id,
                latest_message: r.latest_message,
                latest_message_time: r.latest_message_time,
                partner
            };
        });

        return res.status(200).json({ message: 'Success', data });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching rooms for the user.' });
    }
};
module.exports = { getASCRoom, getAllRoomsByUser, getRoomMessage, getAllMessage, sendMessage, deleteMessage, getMessage };