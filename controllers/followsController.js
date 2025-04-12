const { User, Follows } = require('../models/relationships');
const NotificationService = require('../service/notificationservice');

const getAllFollow = async (req, res) => {
    try {
        const follow = await Follows.findAll();
        if (follow.length === 0) {
            return res.status(404).json({ message: 'No follow found' });
        }
        res.json(follow)
    } catch (error) {
        res.status(500).json({ message: 'Error when get follow' });
    }
}

const addNewFollower = async (req, res) => {
    try {
        const id = req.params.id;
        const { following_id } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            res.status(404).json({ message: 'User not found!' });
        }
        const existingFollow = await Follows.findOne({
            where: {
                follower_id: id,
                following_id: following_id,
            },
        });
        if (existingFollow) {
            await Follows.destroy({
                where: {
                    follower_id: id,
                    following_id: following_id,
                },
            });

            const result = await Follows.findAll({
                where: { follower_id: id },
            });

            return res.status(200).json({ message: 'Unfollowed successfully', data: result });
        } else {
            await Follows.create({
                follower_id: id,
                following_id: following_id,
            });
            const username = await User.findOne({
                where: { id: id },
            }
            )
            await NotificationService(id, 'follow', `${username.username} đã theo dõi bạn`, `/user/${id}`);
            const result = await Follows.findAll({
                where: { follower_id: id },
            });

            return res.status(201).json({ message: 'Followed successfully', data: result });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error when follow someone', error: error });
    }
}

const getAllFollower = async (req, res) => {
    const id = req.params.id;
    try {

        const user = await User.findByPk(id);

        if (!user) {
            res.status(404).json({ message: 'User not found!' });
        }



        const result = await Follows.findAll({
            where: { follower_id: id },
        })

        if (result.length > 0) {
            res.status(200).json({ message: 'Success', data: result })
        }
        else {
            res.status(404).json({ message: 'You have 0 follower' })
        }
    } catch (error) {
        res.status(500).json({ message: 'Error when get follow' });
    }
}

const getAllFollowing = async (req, res) => {
    const id = req.params.id;
    try {

        const user = await User.findByPk(id);

        if (!user) {
            res.status(404).json({ message: 'User not found!' });
        }



        const result = await Follows.findAll({
            where: { following_id: id },
        })

        if (result.length > 0) {
            res.status(200).json({ message: 'Success', data: result })
        }
        else {
            res.status(404).json({ message: 'You have 0 following' })
        }
    } catch (error) {
        res.status(500).json({ message: 'Error when get follow' });
    }
}

const getCountFollower = async (req, res) => {
    try {
        const id = req.params.id;

        const count = await Follows.count({
            where: { follower_id: id }
        })

        res.status(200).json({ message: "Success", data: count });
    } catch (error) {
        res.status(500).json({ message: 'Error when follow someone', error: error });
    }
}

const getCountFollowing = async (req, res) => {
    try {
        const id = req.params.id;

        const count = await Follows.count({
            where: { following_id: id }
        })

        res.status(200).json({ message: "Success", data: count });
    } catch (error) {
        res.status(500).json({ message: 'Error when follow someone', error: error });
    }
}

module.exports = { getAllFollow, getAllFollower, getAllFollowing, addNewFollower, getCountFollower, getCountFollowing };