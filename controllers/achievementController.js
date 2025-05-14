const Achievement = require('../models/relationships');

const getAllAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findAll();
        if (achievement.length === 0) {
            return res.status(404).json({ message: 'No Achievement found' });
        }
        res.json(achievement);
    } catch (error) {
        res.status(500).json({ message: 'Error when get achievement' ,error: error});
    }
};

module.exports = { getAllAchievement };