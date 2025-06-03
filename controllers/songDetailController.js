const { Op, literal } = require('sequelize');
const { SongDetail, Song, User } = require('../models/relationships');
const NotificationService = require('../service/notificationservice');

const getAllSongDetail = async (req, res) => {
    try {
        const songDetail = await SongDetail.findAll();
        if (songDetail.length === 0) {
            return res.status(404).json({ message: 'No song detail found' });
        }
        res.json(songDetail)
    } catch (error) {
        res.status(500).json({ message: 'Error when get song detail' });
    }
}
const getGenre = async(req,res) =>{
        try {
        const response = await fetch('https://api.deezer.com/genre');
        const data = await response.json();
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ message: 'Error when get genre' });
    }
}

const updatePlayWhenListenSong = async (req, res) => {
    const id = req.params.id;
    try {
        const song = await Song.findByPk(id);
        if (!song) {
            return res.status(404).json({ message: 'Song not found ' });
        }
        else {

            const songDetail = await SongDetail.findOne({ where: { song_id: id } });
            if (!songDetail) {
                return res.status(404).json({ message: 'Song detail not found' });
            }
            await SongDetail.update({
                plays: songDetail.plays + 1
            },
                {
                    where: { song_id: id }
                }
            )
        }

        const result = await SongDetail.findOne({
            where: { song_id: id },
        })
        res.status(200).json({ message: 'Success', data: result });
    }
    catch (error) {
        res.status(500).json({ message: 'Error when add play', error: error });
    }
}

    const updateLikeWhenLikeSong = async (req, res) => {
        const id = req.params.id;
        try {
            const song = await Song.findByPk(id);
            if (!song) {
                return res.status(404).json({ message: 'Song not found ' });
            }
            else {

                const songDetail = await SongDetail.findOne({ where: { song_id: id } });
                if (!songDetail) {
                    return res.status(404).json({ message: 'Song detail not found' });
                }
                else {
                    await SongDetail.update({
                        likes: songDetail.likes + 1
                    },
                        {
                            where: { song_id: id }
                        }
                    )
                }
                await NotificationService(id, 'like', `Người dùng đã thích bài viết của bạn`, `/song/${id}`);
                const result = await SongDetail.findOne({
                    where: { song_id: id },
                })
                res.status(200).json({ message: 'Success!', data: result });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error when add likes', error: error });
        }
    }

    module.exports = {getGenre, getAllSongDetail, updatePlayWhenListenSong, updateLikeWhenLikeSong };