const { Song, User, SongDetail, SongArtist, UserSongLog } = require('../models/relationships');
const cloudinary = require('../config/cloudinaryConfig');
const { Op, where, literal } = require('sequelize'); //toan tu sequelize

const getAllSong = async (req, res) => {

    try {
        const UserId = req.params.id;

        const user = await User.findOne({
            where: { id: UserId },

        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        const song = await Song.findAll({
            where: { uploader_id: UserId },
            include: [{
                model: User,
                attributes: ['id','username'],
            },
            {
                model: SongDetail,
                attributes: ['bio', 'duration', 'genre', 'likes', 'plays'],
            },
            {
                model: SongArtist,
                include: [{
                    model: User,
                    attributes: ['username']
                }],
                attributes: [],
            }
            ]
        });
        if (song.length === 0) {
            return res.status(200).json({
                message: "There are no songs in this playlist yet.",
                data: []
            });
        }
        res.status(200).json({ data: song || [] });
    } catch (error) {
        res.status(500).json({ message: 'Error when get song', error: error });
    }
}

const getSongSearch = async (req, res) => {
    try {
        const { key } = req.body;


        const song = await Song.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.like]: `%${key}%` } },
                    { '$SongArtists.User.username$': { [Op.like]: `%${key}%` } }
                ]

            },
            include: [
                {
                    model: SongDetail,
                    attributes: ['bio', 'duration', 'genre', 'likes', 'plays'],
                },
                {
                    model: SongArtist,
                    attributes: [],
                    include: [{
                        model: User,
                        attributes: ['username']
                    }],

                }
            ],
        });
        if (song.length === 0) {
            return res.status(404).json({ message: 'No song found' });
        }
        res.status(200).json({ data: song });


    } catch (error) {
        res.status(500).json({ message: 'An error occurred while searching for songs.', error: error });
    }
}

const addNewSong = async (req, res) => {
    const { artwork, title, genre, bio, duration, privacy,path } = req.body;
    console.log({ artwork, title, genre, bio, duration, privacy ,path});
    try {

        const uploaderid = req.user.id;
        console.log(uploaderid);

        const newSong = await Song.create({
            title,
            artwork,
            uploader_id: uploaderid,
            privacy,
            path
        });

        await SongDetail.create({
            song_id: newSong.id,
            bio,
            duration,
            genre,
        });

        await SongArtist.create({
            song_id: newSong.id,
            artist_id: uploaderid,
        });

        const result = await Song.findOne({
            where: { id: newSong.id },
            include: [
                {
                    model: SongDetail,
                },
                {
                    model: SongArtist,
                    include: [{
                        model: User,
                        attributes: ['username']
                    }]
                }
            ]
        });
        res.status(201).json({ message: 'upload success!', data: result });
    } catch (error) {
        return res.status(500).json({ message: 'Error when add new song', error: error });
    }
}


const getUserIdFromUsername = async (username) => {
    const user = await User.findOne({
        where: { username },
        attributes: ['id'] // Chỉ lấy ID
    });

    if (!user) {
        throw new Error(`User with username "${username}" not found`);
    }

    return user.id;
};

const updateSongById = async (req, res) => {
    const id = req.params.id;
    const { artwork, title, artist, genre, bio, duration, privacy, path } = req.body;

    try {
        const song = await Song.findByPk(id);
        const uploader_idnew = await getUserIdFromUsername(artist);


        if (!song) {
            return res.status(404).json({ message: 'Song not found ' });
        }
        else {
            await Song.update({
                title: title || song.title,
                artwork: artwork || song.artwork,
                privacy: privacy || song.privacy,
                path: path || song.path,
            },
                {
                    where: { id: id }
                },)
        }
        const songDetail = await SongDetail.findOne({ where: { song_id: id } });
        if (songDetail) {
            await SongDetail.update(
                {
                    bio: bio || songDetail.bio,
                    duration: duration || songDetail.duration,
                    genre: genre || songDetail.genre || null,
                },
                {
                    where: { song_id: id }
                },
            )
        }

        const songartist = await SongArtist.findAll({ where: { song_id: id } });

        if (songartist) {
            for (const artist of songartist) {
                await SongArtist.update({
                    artist_id: uploader_idnew || artist.artist_id,
                },
                    {
                        where: { song_id: id }
                    },)
            }
        }


        const result = await Song.findOne({
            where: { id: id },
            include: [
                {
                    model: SongDetail
                },
                {
                    model: SongArtist,
                    include: [{
                        model: User,
                        attributes: ['username'],
                    }],
                },
            ]
        });

        res.status(200).json({ message: 'Update Song Success', data: result });
    } catch (error) {
        return res.status(500).json({ message: 'Error when update song', error: error });
    }
}

const deleteSongById = async (req, res) => {
    const id = req.params.id;
    try {
        const songSelect = await Song.findOne({
            where: { id: id },
        })

        if (!songSelect) {
            res.status(404).json({ message: 'Song not found!' });
        }

        await Song.destroy({
            where: { id: id },
        })

        const allSong = await Song.findAll();

        res.status(200).json({ message: 'Delete song success!', data: allSong });
    } catch (error) {
        res.status(500).json({ message: 'Error when delete song', error: error });
    }
}

const getSongRandom = async (req, res) => {
    try {
        const randomSong = await Song.findAll({
            order: literal('RAND()'),
        })

        res.status(200).json({ message: '10 song random success', data: randomSong });
    } catch (error) {
        res.status(500).json({ message: 'Error when get random song', error: error });
    }
}

const getDESCSong = async (req, res) => {
    try {
        const song = await Song.findAll({
            order: [['created_at', 'DESC']],
            limit: 10,
        })
        const randomSong = song.sort(() => Math.random() - 0.5).slice(0, 7);
        res.status(200).json({ message: "success", data: randomSong });
    } catch (error) {
        res.status(500).json({ message: 'Error when get ascending song', error: error });
    }
}

const getSongPlay = async (req, res) => {
    const { song_id, user_id } = req.body;
    try {
        const song = await Song.findOne({
            where: { id: song_id },
        })
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        await logUser(user_id, song_id);

        res.status(200).json(song);
    } catch (error) {
        console.error("Error when getting song:", error);
        res.status(500).json({ message: "Error when getting song", error: error.message });
    }
}

const logUser = async (user_id, song_id) => {
    try {
        const [userLog, created] = await UserSongLog.findOrCreate({
            where: { user_id, song_id },
            defaults: { listen_count: 1 }
        });

        if (!created) {
            userLog.listen_count += 1;
            await userLog.save();
        }
    } catch (error) {
        console.error("Error when updating log:", error);
        throw error;
    }
};


const getSimilarSongs = async (req, res) => {
    const { song_id, user_id } = req.body;
    try {
        const getLog = await UserSongLog.findOne({
            where: { song_id: song_id, user_id: user_id }
        })
        if (!getLog) {
            return res.status(404).json({ message: "Log not found " });
        }
        else {
            if (getLog.listen_count < 5 && getLog.listen_count >= 2) {
                const currentSong = await Song.findOne({
                    where: { id: song_id },
                    include: [
                        {
                            model: SongDetail,
                            attributes: ['genre'],
                            required: true
                        },
                        {
                            model: SongArtist,
                            attributes: ['artist_id'],
                            required: true
                        }
                    ]
                });

                if (!currentSong) {
                    return res.status(404).json({ message: "Song not found" });
                }
                const genre = currentSong.SongDetail ? currentSong.SongDetail.genre : null;

                const artist_id = currentSong.SongArtists?.length > 0
                    ? currentSong.SongArtists[0].artist_id
                    : null;
                console.log(artist_id);
                if (!genre || !artist_id) {
                    return res.status(404).json({
                        message: "Genre or artist information not found for the song",
                    });
                }

                const getSongByArtist = await Song.findAll({
                    include: [{
                        model: SongArtist,
                        where: {
                            artist_id: artist_id,
                            song_id: { [Op.ne]: song_id }
                        },
                    }],
                    limit: 3,
                    distinct: true
                })
                const getRandomSongByGenre = await Song.findAll({
                    include: [{
                        model: SongDetail,
                        where: {
                            genre: genre,
                            song_id: { [Op.ne]: song_id }
                        },
                    }],
                    limit: 3,
                    distinct: true
                })

                const combinedRes = [...new Map([...getSongByArtist, ...getRandomSongByGenre].map(item => [item.id, item])).values()];

                //Fisher-Yates Shuffle
                for (let i = combinedRes.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [combinedRes[i], combinedRes[j]] = [combinedRes[j], combinedRes[j]];
                }

                res.status(200).json({ message: "Success", data: combinedRes });
            }
            if (getLog.listen_count > 5) {
                const currentSong = await Song.findOne({
                    where: { id: song_id },
                    include: [
                        {
                            model: SongDetail,
                            attributes: ['genre'],
                            required: true
                        },
                        {
                            model: SongArtist,
                            attributes: ['artist_id'],
                            required: true
                        }
                    ]
                });

                if (!currentSong) {
                    return res.status(404).json({ message: "Song not found" });
                }
                const genre = currentSong.SongDetail ? currentSong.SongDetail.genre : null;

                const artist_id = currentSong.SongArtists?.length > 0
                    ? currentSong.SongArtists[0].artist_id
                    : null;
                console.log(artist_id);
                if (!genre || !artist_id) {
                    return res.status(404).json({
                        message: "Genre or artist information not found for the song",
                    });
                }

                const getSongByArtist = await Song.findAll({
                    include: [{
                        model: SongArtist,
                        where: {
                            artist_id: artist_id,
                            song_id: { [Op.ne]: song_id }
                        },
                    }],
                    limit: 5,
                })
                const getRandomSongBySubGenre = await Song.findAll({
                    include: [{
                        model: SongDetail,
                        where: {
                            genre: { [Op.like]: `%${genre}%` },
                            song_id: { [Op.ne]: song_id }
                        },
                    }],
                    limit: 5,
                })

                const combinedRes = [...new Map([...getSongByArtist, ...getRandomSongBySubGenre].map(item => [item.id, item])).values()];

                //Fisher-Yates Shuffle
                for (let i = combinedRes.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [combinedRes[i], combinedRes[j]] = [combinedRes[j], combinedRes[j]];
                }

                res.status(200).json({ message: "Success > 5", data: combinedRes });
            }
        }

    } catch (error) {
        res.status(500).json({ message: "Error when getting song", error: error.message });
    }
}

const getSongById = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await Song.findOne({
            where: { id: id },
            include: [{
                model: User,
                attributes: ['id'],
            },
            {
                model: SongDetail,
                attributes: ['bio', 'duration', 'genre', 'likes', 'plays'],
            },
            {
                model: SongArtist,
                include: [{
                    model: User,
                    attributes: ['username']
                }],
                attributes: [],
            }
            ]
        });
        res.status(200).json({ message: 'Success', data: result });
    } catch (error) {
        res.status(500).json({ message: "Error when getting song", error: error.message });
    }
}


module.exports = { getAllSong, getSongById, getSongSearch, getSongPlay, addNewSong, updateSongById, deleteSongById, getSongRandom, getDESCSong, getSimilarSongs };