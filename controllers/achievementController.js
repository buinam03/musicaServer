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

const createAchievement = async (req, res) => {
    try {
        const { userId, name, description, condition_type, condition_value } = req.body;
        const achievement = await Achievement.create({ userId, name, description, condition_type, condition_value });
        res.json({message: 'Achievement created successfully', data: achievement, statusCode: 201});
    } catch (error) {
        res.status(500).json({ message: 'Error when create achievement' ,error: error});
    }
}

module.exports = { getAllAchievement,createAchievement };