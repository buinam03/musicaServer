const User = require('./user');
const Message = require('./message');
const UserAchievement = require('./userArchievement');
const Achievement = require('./achievement');
const Comment = require('./comment');
const Follows = require('./follows');
const Notification = require('./notification');
const Playlist = require('./playlist');
const SongArtist = require('./songartist');
const SongDetail = require('./songdetail');
const Song = require('./songs');
const PlaylistSong = require('./playlistsong');
const UserSongLog = require('./usersonglogs');
const Like = require('./likes');
const RefreshToken = require('./refreshtokens');

// User <-> UserAchievement
User.hasMany(UserAchievement, { foreignKey: 'userId' });
UserAchievement.belongsTo(User, { foreignKey: 'userId' });

// User <-> Song (uploader)
User.hasMany(Song, { foreignKey: 'uploader_id' });
Song.belongsTo(User, { foreignKey: 'uploader_id' });

// Song <-> SongDetail
Song.hasOne(SongDetail, { foreignKey: 'song_id' });
SongDetail.belongsTo(Song, { foreignKey: 'song_id' });

// Song <-> SongArtist <-> User
Song.hasMany(SongArtist, { foreignKey: 'song_id' });
SongArtist.belongsTo(Song, { foreignKey: 'song_id' });
User.hasMany(SongArtist, { foreignKey: 'artist_id' });
SongArtist.belongsTo(User, { foreignKey: 'artist_id' });

// Song / User <-> Comment
Song.hasMany(Comment, { foreignKey: 'song_id' });
Comment.belongsTo(Song, { foreignKey: 'song_id' });
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

// User <-> Follows
User.hasMany(Follows, { foreignKey: 'follower_id', as: 'following' });
User.hasMany(Follows, { foreignKey: 'following_id', as: 'followers' });
Follows.belongsTo(User, { foreignKey: 'follower_id', as: 'follower' });
Follows.belongsTo(User, { foreignKey: 'following_id', as: 'following' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// User <-> Message
User.hasMany(Message, { as: 'sender', foreignKey: 'send_id' });
User.hasMany(Message, { as: 'receiver', foreignKey: 'receive_id' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'send_id' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receive_id' });

// User / Song <-> Like
User.hasMany(Like, { foreignKey: 'user_id' });
Like.belongsTo(User, { foreignKey: 'user_id' });
Song.hasMany(Like, { foreignKey: 'song_id' });
Like.belongsTo(Song, { foreignKey: 'song_id' });

// User <-> Playlist (creator)
User.hasMany(Playlist, { foreignKey: 'creator_id', as: 'creator' });
Playlist.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });

// Playlist <-> Song (n-n qua PlaylistSong)
Playlist.belongsToMany(Song, { through: PlaylistSong, foreignKey: 'playlist_id', otherKey: 'song_id' });
Song.belongsToMany(Playlist, { through: PlaylistSong, foreignKey: 'song_id', otherKey: 'playlist_id' });

// User <-> Song (n-n qua UserSongLog - lịch sử nghe)
User.belongsToMany(Song, { through: UserSongLog, foreignKey: 'user_id', otherKey: 'song_id' });
Song.belongsToMany(User, { through: UserSongLog, foreignKey: 'song_id', otherKey: 'user_id' });

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
    Like,
    RefreshToken,
};
