const { where, Op } = require('sequelize');
const { Playlist, Song, PlaylistSong, User } = require('../models/relationships');

const getAllPlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findAll();
        if (playlist.length === 0) {
            return res.status(404).json({ message: 'No playlist found' });
        }
        res.json(playlist)
    } catch (error) {
        res.status(500).json({ message: 'Error when get playlist' });
    }
}

const createNewPlaylist = async (req, res) => {
    const { name, artwork, creator_id } = req.body;
    try {
        const user = await User.findOne({
            where: { id: creator_id },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await Playlist.create({
            name: name,
            artwork: artwork,
            creator_id: creator_id,
        })

        const result = await Playlist.findOne({
            where: { name: name }
        })

        res.status(201).json({ message: "Success", data: result });
    } catch (error) {
        res.status(500).json({ message: 'Error when create new playlist' });
    }
}

const createNewPlaylistNotName = async (req, res) => {
    try {
        const { playlist_id, song_id, user_id } = req.body;
        const song = await Song.findOne({ where: { id: song_id } });
        const user = await User.findOne({ where: { id: user_id } });
        let username = "";
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        else {
            username = user.username;
        }
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }
        console.log(username);
        console.log(playlist_id);
        if (playlist_id == null) {
            const existingPlaylists = await Playlist.findAll({
                where: {
                    name: {
                        [Op.like]: `Playlist ${username} #%`
                    },
                    creator_id: user_id
                }
            });
            if (existingPlaylists.length === 0) {
                console.log('No playlists found for the given criteria.');
            } else {
                console.log('Playlists found:', existingPlaylists);
            }
            let finalName = `Playlist ${username}`;
            console.log(finalName);
            console.log(existingPlaylists.length);
            if (existingPlaylists.length > 0) {
                const numbers = existingPlaylists.map(p => {
                    const match = p.name.match(/#(\d+)$/); // Tìm số đuôi #n
                    return match ? parseInt(match[1]) : 0; // Trả về số đuôi, nếu không có thì trả về 0
                });

                const maxNum = Math.max(...numbers);
                finalName = `Playlist ${username} #${maxNum + 1}`; // Tạo tên mới với số +1
            }

            const newPlaylist = await Playlist.create({
                name: finalName,
                artwork: 'test',
                creator_id: user_id,
            });
            res.status(201).json({ message: "Success", data: newPlaylist });
        }
        else {
            // Nếu có playlist_id, tìm playlist
            playlist = await Playlist.findOne({ where: { id: playlist_id } });
            if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        }

    } catch (error) {
        res.status(500).json({ message: 'Error when create new playlist withoutname', error: error });
    }
}

const addSongToPlaylist = async (req, res) => {
    const { playlist_id, song_id } = req.body;
    try {
        const playlistSong = await PlaylistSong.findOne({
            where: { playlist_id: playlist_id, song_id: song_id },
        });
        console.log(playlistSong);
        if (playlistSong) {
            res.status(500).json({ message: "Song is already in the playlist" });
        }
        else {
            await PlaylistSong.create({
                playlist_id: playlist_id,
                song_id: song_id,
            });

        }
        const result = await PlaylistSong.findAll({
            where: { playlist_id: playlist_id },
        })

        res.status(201).json({ message: "Success", data: result });
        console.log(`Song ${song_id} added to playlist ${playlist_id}`);
    } catch (error) {
        res.status(500).json({ message: 'Error when add song to playlist', error: error })
    }
}

const deletePlaylist = async (req, res) => {
    const { playlist_id } = req.body;
    try {

        const playlist = await Playlist.findOne({
            where: { id: playlist_id }
        })
        if (playlist) {
            await PlaylistSong.destroy({
                where: { playlist_id: playlist_id },
            })
            await Playlist.destroy({
                where: { id: playlist_id },
            })
        }
        else{
            res.status(404).json({message : "Playlist not found!"});
        }
        const result = Playlist.findAll();

        res.status(200).json({ message: "Delete playlist success", data: result });
    } catch (error) {
        res.status(500).json({ message: 'Error when delete playlist', error: error })
    }
}

const getTest = async (req, res) => {
    const { username, user_id } = req.body;
    const existingPlaylists = await Playlist.findAll({
        where: {
            name: {
                [Op.like]: `Playlist ${username}%#%`
            },
            creator_id: user_id
        }
    });
    if (existingPlaylists.length === 0) {
        console.log('No playlists found for the given criteria.');
    } else {
        console.log('Playlists found:', existingPlaylists);
    }
    res.status(200).json({ data: existingPlaylists });
}

module.exports = { getAllPlaylist, createNewPlaylist, createNewPlaylistNotName, addSongToPlaylist, deletePlaylist, getTest };