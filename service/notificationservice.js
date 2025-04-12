const { Notification, User } = require('../models/relationships');

const CreateNotification = async (user_id, type, message, link = null) => {

    try {
        const user = await User.findByPk(user_id);
        if (!user) {
            console.log('User not found!');
            return null;
        }

        let title = '';
        switch (type) {
            case 'like':
                title = 'Someone liked your post!';
                break;
            case 'follow':
                title = 'You have a new follower!';
                break;
            case 'comment':
                title = 'Someone commented on your post!';
                break;
            default:
                title = 'System notification';
        }
        const notification = await Notification.create({
            user_id,
            type,
            title,
            message,
            link,
        });

        return notification;

    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

module.exports = CreateNotification;