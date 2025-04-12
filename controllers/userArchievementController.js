const { UserAchievement, User } = require('../models/relationships');

const getAllUserArchievement = async (req, res) => {
    try {
        const { UserId } = req.body;

        const user = await User.findOne({
            where: { id: UserId },

        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }



        const userAchievements = await UserAchievement.findAll({
            where: { user_id: UserId }, // Sử dụng userId thay vì userid
            include: [{
                model: User,
                attributes: ['username'],
            }]
        });


        if (userAchievements.length === 0) {
            return res.status(404).json({ message: "No userarchievement found" });
        }
        res.status(200).json({ data: userAchievements });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy userArchievement ", error: error });
    }
}

const savedAchievementByUser = async (req, res) => {
    const { user_id, achivement_ids } = req.body;
    try {
        
        if (!user_id || !Array.isArray(achivement_ids || achivement_ids.length != 4)) {
            res.status(400).json({ message: 'Invalid input. Must provide userId and exactly 4 achievementIds.' });
        await UserAchievement.destroy({
            where: {user_id : user_id}
        })
        const achievementsToSave = achivement_ids.map(id => ({ user_id, achievement_id: id }));

        await UserAchievement.bulkCreate(achievementsToSave);
        res.status(201).json({message: "success!"});
        }
    } catch (error) {
        res.status(500).json({ message: 'Error when create achievement' });
    }
}

module.exports = { getAllUserArchievement,savedAchievementByUser };