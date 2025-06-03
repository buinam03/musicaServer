const { Comment, User, Song } = require('../models/relationships');

const getAllComment = async (req, res) => {
    const id = req.params.id;
    const {time} = req.query;
    try {
        const comment = await Comment.findAll(
            {
                where: {song_id : id},
                include: {
                    model: User,
                    attributes: ['id','username','profile_picture'],
                },
                order: [['created_at',`${time}`]],
            }
        );
        if (comment.length === 0) {
            return res.status(404).json({ message: 'No comment found' });
        }
        res.status(200).json({message: 'success',data: comment});
    } catch (error) {
        res.status(500).json({ message: 'Error when get comment',error: error });
    }
}

const addNewCommentToSong = async (req, res) => {
    try {
        const id = req.params.id;
        const song = await Song.findByPk(id);
        const { user_id, content, parent_id } = req.body;
        const user = await User.findByPk(user_id);
        if (!user) {
            res.status(404).json({ message: 'User not found!' });
        }
        if (!song) {
            res.status(404).json({ message: 'Song not found!' });
        }
        else {
            await Comment.create({
                song_id : id,
                user_id: user_id,
                content: content,
                parent_id: null || parent_id,
            })

            const result = await Comment.findOne({ 
                where : {song_id : id},
                include: {
                    model: User,
                    attributes: ['id','username','profile_picture'],
                },
                order: [['created_at','DESC']],
             })

            res.status(201).json({ message: 'Comment Success', data: result});
        }


    } catch (error) {
        res.status(500).json({ message: 'Error when add comment' });
    }
}

module.exports = { getAllComment ,addNewCommentToSong};