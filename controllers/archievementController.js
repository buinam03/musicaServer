const Archievement = require('../models/archievement');

const getAllArchievement = async(req,res) =>{
    try {
        const archievement = await Archievement.findAll();
        if(archievement.length === 0){
            return res.status(404).json({ message: 'No Archievement found' });
        }
        res.json(archievement)
    } catch (error) {
        res.status(500).json({ message: 'Error when get archievement' });
    }
}



module.exports = {getAllArchievement};