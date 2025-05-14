const Notification = require('../models/notification');
const User = require('../models/user');

const getAllNotification = async(req,res) =>{
    try {
        const id = req.user.id;
        const notification = await Notification.findAll({
            where : {user_id : id},
            include : [{
                model: User,
                attributes: ['username' , 'profile_picture']
            }]
        });
        if(notification.length === 0){
            return res.status(404).json({ message: 'No notification found' });
        }
        res.status(200).json({message: 'Success',data:notification});
    } catch (error) {
        res.status(500).json({ message: 'Error when get notification' ,error: error});
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