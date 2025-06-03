const { SongArtist, SongDetail, Song, User, Like } = require('../models/relationships');
const NotificationService = require('../service/notificationservice');

const toggleLike = async (req, res) => {
    try {
        const { user_id, song_id } = req.body;

        // Check if the like already exists
        const existingLike = await Like.findOne({
            where: {
                user_id,
                song_id
            }
        });

        if (existingLike) {
            // If like exists, remove it (unlike)
            await existingLike.destroy();
            return res.status(200).json({
                success: true,
                message: 'Song unliked successfully',
                isLiked: false
            });
        } else {
            // If like doesn't exist, create it
            await Like.create({
                user_id,
                song_id
            });
            const username = await User.findOne({
                where: { id: user_id },
            });
            // Get song uploader info to send notification
            const song = await Song.findByPk(song_id);
            if (song && song.uploader_id !== user_id) {
                // Create notification for song uploader
                await NotificationService({
                    user_id: song.uploader_id,
                    type: 'like',
                    message: `${username.username} liked your song`,
                    link: `/song/${song_id}`,
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Song liked successfully',
                isLiked: true
            });
        }
    } catch (error) {
        console.error('Error in toggleLike:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get like status for a song
const getLikeStatus = async (req, res) => {
    try {
        const { user_id, song_id } = req.query;

        const like = await Like.findOne({
            where: {
                user_id,
                song_id
            }
        });

        return res.status(200).json({
            success: true,
            isLiked: !!like
        });
    } catch (error) {
        console.error('Error in getLikeStatus:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get total likes for a song
const getSongLikes = async (req, res) => {
    try {
        const { song_id } = req.params;

        const likeCount = await Like.count({
            where: {
                song_id
            }
        });

        return res.status(200).json({
            success: true,
            likes: likeCount
        });
    } catch (error) {
        console.error('Error in getSongLikes:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
const getAllSongLiked = async (req, res) => {
    try {
        const { user_id } = req.query;
        const like = await Like.findAll({
            where: {
                user_id: user_id
            },
            include: [{
                model: Song,
                attributes: ['id', 'title', 'artwork', 'is_public', 'path'],
                include: [{
                    model: User,
                    attributes: ['id', 'username']
                },
                {
                    model: SongDetail,
                    attributes: ['bio', 'duration', 'genre', 'likes', 'plays']
                },
                {
                    model: SongArtist,
                    include: [{
                        model: User,
                        attributes: ['username']
                    }],
                    attributes: []
                }]
            }]
        });
        return res.status(200).json({ data: like });
    } catch (error) {
        console.error('Error in getAllSongLiked:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}
const getSongLikeById = async (req, res) => {
    try {
        const { user_id } = req.query;
        const likedSongs = await Like.findAll({
            where: {
                user_id: user_id
            },
            include: [{
                model: Song,
                attributes: ['id', 'title', 'artwork', 'is_public', 'path'],
                include: [{
                    model: User,
                    attributes: ['id', 'username']
                },
                {
                    model: SongDetail,
                    attributes: ['bio', 'duration', 'genre', 'likes', 'plays']
                },
                {
                    model: SongArtist,
                    include: [{
                        model: User,
                        attributes: ['username']
                    }],
                    attributes: []
                }]
            }]
        });
        return res.status(200).json({ 
            success: true,
            data: likedSongs 
        });
    } catch (error) {
        console.error('Error in getSongLikeById:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

module.exports = {
    toggleLike,
    getLikeStatus,
    getSongLikes,
    getAllSongLiked,
    getSongLikeById
};