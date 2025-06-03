const User = require('../models/user');
const Message = require('../models/message');
const UserAchievement = require('../models/userArchievement');
const Achievement = require('./achievement');
const Comment = require('../models/comment');
const Follows = require('../models/follows');
const Notification = require('../models/notification');
const Playlist = require('../models/playlist');
const SongArtist = require('../models/songartist');
const SongDetail = require('../models/songdetail');
const Song = require('../models/songs');
const PlaylistSong = require("../models/playlistsong");
const UserSongLog = require('../models/usersonglogs');
const Like = require('../models/likes');
//User vs UserArchieve
User.hasMany(UserAchievement, { foreignKey: 'user_id' });
UserAchievement.belongsTo(User, { foreignKey: 'user_id' });

//User vs Song
User.hasMany(Song, { foreignKey: 'uploader_id' }); // Một User có thể tải lên nhiều bài hát
Song.belongsTo(User, { foreignKey: 'uploader_id' }); // Mỗi bài hát được tải lên bởi một User

// //Song vs Songdetail
Song.hasOne(SongDetail, { foreignKey: 'song_id' });
SongDetail.belongsTo(Song, { foreignKey: 'song_id' });

// //Song vs artist
Song.hasMany(SongArtist, { foreignKey: 'song_id' });
SongArtist.belongsTo(Song, { foreignKey: 'song_id' });

SongArtist.belongsTo(User, { foreignKey: 'artist_id'});

// //Song vs Comment
Song.hasMany(Comment, { foreignKey: 'song_id' });
Comment.belongsTo(Song, { foreignKey: 'song_id' });

// //Comment vs User
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

// //SongArtist vs User
SongArtist.belongsTo(User, { foreignKey: 'artist_id'});
User.hasMany(SongArtist, { foreignKey: 'artist_id' });   // Một User có thể liên kết với nhiều SongArtist

//User vs Follower
User.hasMany(Follows, { foreignKey: 'follower_id', as: 'following' });
User.hasMany(Follows, { foreignKey: 'following_id', as: 'followers' });
Follows.belongsTo(User, { foreignKey: 'follower_id', as: 'follower' });
Follows.belongsTo(User, { foreignKey: 'following_id', as: 'following' });

//User vs Comment
User.hasMany(Comment,{foreignKey: 'user_id'});
Comment.belongsTo(User,{foreignKey: 'user_id'});

//User vs Notification
User.hasMany(Notification,{foreignKey: 'user_id'});
Notification.belongsTo(User,{foreignKey: 'user_id'});

User.hasMany(Message, { as: 'sender',   foreignKey: 'send_id'   });
User.hasMany(Message, { as: 'receiver', foreignKey: 'receive_id' });

Message.belongsTo(User, { as: 'sender',   foreignKey: 'send_id' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receive_id' });

User.hasMany(Like, {foreignKey : 'user_id'});
Like.belongsTo(User,{foreignKey : 'user_id'});

Song.hasMany(Like, {foreignKey : 'song_id'});
Like.belongsTo(Song, {foreignKey : 'song_id'});
 
//Song vs Playlist
Playlist.belongsToMany(Song,{
    through : 'PlaylistSong',
    foreignKey : 'playlist_id',
    otherKey : 'song_id',
});
Song.belongsToMany(Playlist,{
    through : 'PlaylistSong',
    foreignKey : 'playlist_id',
    otherKey : 'song_id',
});

//User + Song -> Log
User.belongsToMany(Song, {
    through: 'UserSongLog',
    foreignKey: 'user_id',
    otherKey: 'song_id',
});

Song.belongsToMany(User, {
    through: 'UserSongLog',
    foreignKey: 'song_id',
    otherKey: 'user_id',
});



module.exports = {
        User,
    UserAchievement,
    Achievement,
    Comment,
    Notification,
    Follows,
    Playlist,
    SongArtist,
    SongDetail,
    Song,
    PlaylistSong,
    Message,
    UserSongLog,
    Like
}