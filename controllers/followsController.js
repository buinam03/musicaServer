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

const getFollowerById = async(req,res) =>{
    try {
        const id = req.user.id;
        const userId = req.params.id;
        console.log(userId);

        const result = await Follows.findOne({
            where: {
                follower_id : id,
                following_id : userId
                
            }
        })
        res.status(200).json({message: 'Success', data: result});
    } catch (error) {
        res.status(500).json({ message: 'Error when get follow',error: error });
    }
}

const addNewFollower = async (req, res) => {
    try {
        const id = req.user.id;
        console.log(id);
        const { following_id } = req.body;

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
            await NotificationService(following_id, 'follow', `${username.username} is now following you.`, `/user/${id}`);
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
    // 1. Validate input
    const { ids } = req.query;
    
    if (!ids || typeof ids !== 'string') {
        return res.status(400).json({
            success: false,
            message: "Thiếu hoặc sai định dạng tham số 'ids'",
            example: "/follows/getAllFollower?ids=1,2,3"
        });
    }

    try {
        // 2. Xử lý chuỗi IDs
        const idArray = ids.split(',')
            .map(id => parseInt(id.trim()))
            .filter(id => !isNaN(id)); // Lọc giá trị không phải số

        if (idArray.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Không có ID hợp lệ"
            });
        }

        // 3. Truy vấn CSDL
        const followers = await Follows.findAll({
            where: { follower_id: idArray }
        });

        res.status(200).json({
            success: true,
            count: followers.length,
            data: followers
        });

    } catch (error) {
        console.error("[SERVER ERROR]", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",           
        });
    }
};
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

module.exports = { getFollowerById,getAllFollow, getAllFollower, getAllFollowing, addNewFollower, getCountFollower, getCountFollowing };