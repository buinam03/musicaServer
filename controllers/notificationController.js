const Notification = require('../models/notification');

const getAllNotification = async(req,res) =>{
    try {
        const notification = await Notification.findAll();
        if(notification.length === 0){
            return res.status(404).json({ message: 'No notification found' });
        }
        res.json(notification)
    } catch (error) {
        res.status(500).json({ message: 'Error when get notification' });
    }
}

const getUserNotifications  = async(req,res) =>{
    try {
        const id = req.params.id;

    } catch (error) {
        res.status(500).json({ message: 'Error ',error: error });
    }
}

module.exports = {getAllNotification};