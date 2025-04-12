const {Message} = require('../models/relationships');

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

const sendMessage = async (req, res) => {

    try {
        const { send_id, receive_id, message } = req.body;

        if (!send_id || !receive_id || !message) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // Tạo tin nhắn mới
        const newMessage = await Message.create({
            send_id,
            receive_id,
            message,
        });

        res.status(201).json({
            message: "Message sent successfully.",
            data: newMessage,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while sending the message." });
    }
};

const getMessage = async(req,res) =>{
    const {send_id,receive_id} = req.body;
    try {
        const result = await Message.findAll({
            where : {send_id : send_id , receive_id : receive_id}
        })

        res.status(200).json({
            message: "get Message successfully.",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while get the message." ,error : error});
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
module.exports = { getAllMessage,sendMessage,deleteMessage,getMessage };