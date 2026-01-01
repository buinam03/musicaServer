const { where, Op } = require('sequelize');
const { Playlist, Song, PlaylistSong, User,SongDetail } = require('../models/relationships');

// GET - Lấy tất cả playlist
const getAllPlaylist = async (req, res) => {
    try {
        const playlists = await Playlist.findAll({
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username', 'profile_picture']
                },
                {
                    model: Song,
                    through: { attributes: [] },
                    attributes: ['id', 'title', 'artwork']
                }
            ],
            order: [['created_at', 'DESC']]
        });
        
        if (playlists.length === 0) {
            return res.status(404).json({ message: 'No playlist found' });
        }
        res.status(200).json({ message: 'Success', data: playlists });
    } catch (error) {
        console.error('Error when get playlist:', error);
        res.status(500).json({ message: 'Error when get playlist', error: error.message });
    }
}

// GET - Lấy playlist theo ID
const getPlaylistById = async (req, res) => {
    try {
        const { playlist_id } = req.params;
        
        if (!playlist_id) {
            return res.status(400).json({ message: 'Playlist ID is required' });
        }

        const playlist = await Playlist.findOne({
            where: { id: playlist_id },
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username', 'profile_picture']
                },
                {
                    model: Song,
                    through: { attributes: ['created_at'] },
                    attributes: ['id', 'title', 'artwork','path', 'uploader_id'],
                    include: [{
                        model: User,
                        attributes: ['id', 'username', 'profile_picture']
                    }]
                }
            ]
        });

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        res.status(200).json({ message: 'Success', data: playlist });
    } catch (error) {
        console.error('Error when get playlist by ID:', error);
        res.status(500).json({ message: 'Error when get playlist by ID', error: error.message });
    }
}

// GET - Lấy playlists theo user_id
const getPlaylistsByUserId = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const playlists = await Playlist.findAll({
            where: { creator_id: user_id },
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username', 'profile_picture']
                },
                {
                    model: Song,
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({ message: 'Success', data: playlists });
    } catch (error) {
        console.error('Error when get playlists by user ID:', error);
        res.status(500).json({ message: 'Error when get playlists by user ID', error: error.message });
    }
}

// POST - Tạo playlist mới
const createNewPlaylist = async (req, res) => {
    try {
        const { name, artwork, creator_id } = req.body;
        
        if (!name || !creator_id) {
            return res.status(400).json({ message: 'Name and creator_id are required' });
        }

        const user = await User.findOne({
            where: { id: creator_id },
        });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const playlist = await Playlist.create({
            name: name.trim(),
            artwork: artwork || null,
            creator_id: creator_id,
        });

        const result = await Playlist.findOne({
            where: { id: playlist.id },
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username', 'profile_picture']
                }
            ]
        });

        res.status(201).json({ message: "Playlist created successfully", data: result });
    } catch (error) {
        console.error('Error when create new playlist:', error);
        res.status(500).json({ message: 'Error when create new playlist', error: error.message });
    }
}

// POST - Tạo playlist tự động (không có tên) hoặc thêm song vào playlist có sẵn
const createNewPlaylistNotName = async (req, res) => {
    try {
        const { playlist_id, song_id, user_id } = req.body;
        
        if (!song_id || !user_id) {
            return res.status(400).json({ message: 'song_id and user_id are required' });
        }

        const song = await Song.findOne({ where: { id: song_id } });
        const user = await User.findOne({ where: { id: user_id } });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        let playlist;
        
        if (!playlist_id) {
            // Tạo playlist mới với tên tự động
            const existingPlaylists = await Playlist.findAll({
                where: {
                    name: {
                        [Op.like]: `Playlist ${user.username} #%`
                    },
                    creator_id: user_id
                }
            });

            let finalName = `Playlist ${user.username}`;
            
            if (existingPlaylists.length > 0) {
                const numbers = existingPlaylists.map(p => {
                    const match = p.name.match(/#(\d+)$/);
                    return match ? parseInt(match[1]) : 0;
                });
                const maxNum = Math.max(...numbers);
                finalName = `Playlist ${user.username} #${maxNum + 1}`;
            }

            playlist = await Playlist.create({
                name: finalName,
                artwork: null,
                creator_id: user_id,
            });
        } else {
            // Tìm playlist có sẵn
            playlist = await Playlist.findOne({ where: { id: playlist_id } });
            if (!playlist) {
                return res.status(404).json({ message: "Playlist not found" });
            }
            
            // Kiểm tra quyền sở hữu
            if (playlist.creator_id !== user_id) {
                return res.status(403).json({ message: "You don't have permission to modify this playlist" });
            }
        }

        // Thêm song vào playlist
        const existingPlaylistSong = await PlaylistSong.findOne({
            where: { playlist_id: playlist.id, song_id: song_id }
        });

        if (existingPlaylistSong) {
            return res.status(400).json({ message: "Song is already in the playlist" });
        }

        await PlaylistSong.create({
            playlist_id: playlist.id,
            song_id: song_id,
        });

        const result = await Playlist.findOne({
            where: { id: playlist.id },
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username', 'profile_picture']
                },
                {
                    model: Song,
                    through: { attributes: [] },
                    attributes: ['id', 'title', 'artwork']
                }
            ]
        });

        res.status(201).json({ message: "Success", data: result });
    } catch (error) {
        console.error('Error when create new playlist without name:', error);
        res.status(500).json({ message: 'Error when create new playlist without name', error: error.message });
    }
}

// POST - Thêm song vào playlist
const addSongToPlaylist = async (req, res) => {
    try {
        const { playlist_id, song_id } = req.body;
        
        if (!playlist_id || !song_id) {
            return res.status(400).json({ message: 'playlist_id and song_id are required' });
        }

        const playlist = await Playlist.findOne({ where: { id: playlist_id } });
        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        const song = await Song.findOne({ where: { id: song_id } });
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        const existingPlaylistSong = await PlaylistSong.findOne({
            where: { playlist_id: playlist_id, song_id: song_id }
        });

        if (existingPlaylistSong) {
            return res.status(400).json({ message: "Song is already in the playlist" });
        }

        await PlaylistSong.create({
            playlist_id: playlist_id,
            song_id: song_id,
        });

        const result = await Playlist.findOne({
            where: { id: playlist_id },
            include: [
                {
                    model: Song,
                    through: { attributes: ['created_at'] },
                    attributes: ['id', 'title', 'artwork']
                }
            ]
        });

        res.status(201).json({ message: "Song added to playlist successfully", data: result });
    } catch (error) {
        console.error('Error when add song to playlist:', error);
        res.status(500).json({ message: 'Error when add song to playlist', error: error.message });
    }
}

// DELETE - Xóa song khỏi playlist
const removeSongFromPlaylist = async (req, res) => {
    try {
        const { playlist_id, song_id } = req.body;
        
        if (!playlist_id || !song_id) {
            return res.status(400).json({ message: 'playlist_id and song_id are required' });
        }

        const playlistSong = await PlaylistSong.findOne({
            where: { playlist_id: playlist_id, song_id: song_id }
        });

        if (!playlistSong) {
            return res.status(404).json({ message: "Song not found in playlist" });
        }

        await PlaylistSong.destroy({
            where: { playlist_id: playlist_id, song_id: song_id }
        });

        const result = await Playlist.findOne({
            where: { id: playlist_id },
            include: [
                {
                    model: Song,
                    through: { attributes: [] },
                    attributes: ['id', 'title', 'artwork']
                }
            ]
        });

        res.status(200).json({ message: "Song removed from playlist successfully", data: result });
    } catch (error) {
        console.error('Error when remove song from playlist:', error);
        res.status(500).json({ message: 'Error when remove song from playlist', error: error.message });
    }
}

// PUT - Cập nhật playlist
const updatePlaylist = async (req, res) => {
    try {
        const { playlist_id } = req.params;
        const { name, artwork } = req.body;
        
        if (!playlist_id) {
            return res.status(400).json({ message: 'playlist_id is required' });
        }

        const playlist = await Playlist.findOne({ where: { id: playlist_id } });
        
        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (artwork !== undefined) updateData.artwork = artwork;
        updateData.updated_at = new Date();

        await Playlist.update(updateData, {
            where: { id: playlist_id }
        });

        const result = await Playlist.findOne({
            where: { id: playlist_id },
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username', 'profile_picture']
                },
                {
                    model: Song,
                    through: { attributes: [] },
                    attributes: ['id', 'title', 'artwork']
                }
            ]
        });

        res.status(200).json({ message: "Playlist updated successfully", data: result });
    } catch (error) {
        console.error('Error when update playlist:', error);
        res.status(500).json({ message: 'Error when update playlist', error: error.message });
    }
}

// DELETE - Xóa playlist
const deletePlaylist = async (req, res) => {
    try {
        const { playlist_id } = req.params;
        
        if (!playlist_id) {
            return res.status(400).json({ message: 'playlist_id is required' });
        }

        const playlist = await Playlist.findOne({
            where: { id: playlist_id }
        });

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        // Xóa tất cả songs trong playlist (cascade sẽ tự động xóa)
        await PlaylistSong.destroy({
            where: { playlist_id: playlist_id }
        });

        // Xóa playlist
        await Playlist.destroy({
            where: { id: playlist_id }
        });

        res.status(200).json({ message: "Playlist deleted successfully" });
    } catch (error) {
        console.error('Error when delete playlist:', error);
        res.status(500).json({ message: 'Error when delete playlist', error: error.message });
    }
}

const createPlaylistCMS = async (req,res) => {
    try {
        const { name, artwork } = req.body;

        await Playlist.create({
            name: name,
            artwork: artwork,
            isCms: true,
        });

        res.status(201).json({ message: "Playlist created successfully", data: result });
    } catch (error) {
        console.error('Error when create cms playlist:', error);
        res.status(500).json({ message: 'Error when create cms playlist', error: error.message });
    }
}

// Helper function để xóa song khỏi playlist CMS theo genre
const removeSongFromPlaylistCMSByGenre = async (idGenre, song_id) => {
    try {
        if (!idGenre || !song_id) {
            console.error('Missing idGenre or song_id');
            return;
        }

        // Tìm playlist CMS có idGenre trùng với genre của bài hát
        const playlist = await Playlist.findOne({ 
            where: { 
                isCms: true,
                idGenre: idGenre
            } 
        });

        if (!playlist) {
            console.log(`No CMS playlist found for idGenre: ${idGenre}`);
            return;
        }

        // Xóa song khỏi playlist
        const deleted = await PlaylistSong.destroy({
            where: { 
                playlist_id: playlist.id, 
                song_id: song_id 
            }
        });

        if (deleted > 0) {
            console.log(`Song ${song_id} removed from CMS playlist ${playlist.id} (idGenre: ${idGenre}, name: ${playlist.name || 'N/A'})`);
        } else {
            console.log(`Song ${song_id} not found in playlist ${playlist.id} (idGenre: ${idGenre})`);
        }
    } catch (error) {
        console.error('Error when remove song from cms playlist by genre:', error);
        // Không throw error để không làm gián đoạn quá trình update
    }
}

// Helper function để thêm song vào playlist CMS theo genre
const addSongToPlaylistCMSByGenre = async (idGenre, song_id) => {
    try {
        if (!idGenre || !song_id) {
            console.error('Missing idGenre or song_id');
            return;
        }

        // Tìm playlist CMS có idGenre trùng với genre của bài hát
        const playlist = await Playlist.findOne({ 
            where: { 
                isCms: true,
                idGenre: idGenre
            } 
        });

        if (!playlist) {
            console.log(`No CMS playlist found for idGenre: ${idGenre}`);
            return;
        }

        const song = await Song.findOne({ where: { id: song_id } });
        if (!song) {
            console.error(`Song not found: ${song_id}`);
            return;
        }

        // Kiểm tra xem song đã có trong playlist chưa
        const existingPlaylistSong = await PlaylistSong.findOne({
            where: { playlist_id: playlist.id, song_id: song_id }
        });

        if (existingPlaylistSong) {
            console.log(`Song ${song_id} already in playlist ${playlist.id} (idGenre: ${idGenre})`);
            return;
        }

        await PlaylistSong.create({
            playlist_id: playlist.id,
            song_id: song_id,
        });

        console.log(`Song ${song_id} added to CMS playlist ${playlist.id} (idGenre: ${idGenre}, name: ${playlist.name || 'N/A'})`);
    } catch (error) {
        console.error('Error when add song to cms playlist by genre:', error);
        // Không throw error để không làm gián đoạn quá trình addNewSong
    }
}

// Route handler để thêm song vào playlist CMS (giữ nguyên cho API)
const addSongToPlaylistCMS = async (req,res) => {
    try {
        const { playlist_id, song_id } = req.body;

        const playlist = await Playlist.findOne({ where: { id: playlist_id,isCms: true } });
        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        const song = await Song.findOne({ where: { id: song_id } });

        // const songGenre = await SongDetail.findOne({ where: { song_id: song_id } });
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        await PlaylistSong.create({
            playlist_id: playlist_id,
            song_id: song_id,
        });

        res.status(201).json({ message: "Song added to playlist successfully"});
    } catch (error) {
        console.error('Error when add song to cms playlist:', error);
        res.status(500).json({ message: 'Error when add song to cms playlist', error: error.message });
    }
}

const getPlaylistCMS = async (req,res) => {
    try {
        const playlists = await Playlist.findAll({ where: { isCms: true } });
        if (playlists.length === 0) {
            return res.status(200).json({ message: "No playlist found", data: [] });
        }
        const randomPlaylists = playlists.sort(() => Math.random() - 0.5).slice(0, 5);

        res.status(200).json({ message: "Success", data: randomPlaylists });
    } catch (error) {
        console.error('Error when get cms playlist:', error);
        res.status(500).json({ message: 'Error when get cms playlist', error: error.message });
    }
}

const getAllPlaylistCMS = async (req,res) => {
    try {
        const playlists = await Playlist.findAll({ where: { isCms: true } });
        res.status(200).json({ message: "Success", data: playlists });
    } catch (error) {
        console.error('Error when get all cms playlist:', error);
        res.status(500).json({ message: 'Error when get all cms playlist', error: error.message });
    }
}

module.exports = { 
    getAllPlaylist, 
    getPlaylistById,
    getPlaylistsByUserId,
    createNewPlaylist, 
    createNewPlaylistNotName, 
    updatePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    createPlaylistCMS,
    addSongToPlaylistCMS,
    addSongToPlaylistCMSByGenre,
    removeSongFromPlaylistCMSByGenre,
    getPlaylistCMS,
    getAllPlaylistCMS
};