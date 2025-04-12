const Artist = require('../models/songartist');

const getAllArtist = async(req,res) =>{
    try {
        const artist = await Artist.findAll();
        if(artist.length === 0){
            return res.status(404).json({ message: 'No artist found' });
        }
        res.json(artist)
    } catch (error) {
        res.status(500).json({ message: 'Error when get artist' });
    }
}

module.exports = {getAllArtist};