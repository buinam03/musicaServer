const { UserSongLog } = require('../models');

const findOne = (userId, songId) => UserSongLog.findOne({ where: { user_id: userId, song_id: songId } });

/** Tạo log nếu chưa có, ngược lại tăng listen_count. Trả về log sau cập nhật. */
const recordListen = async (userId, songId) => {
    const [log, created] = await UserSongLog.findOrCreate({
        where: { user_id: userId, song_id: songId },
        defaults: { listen_count: 1 },
    });

    if (!created) {
        await log.increment('listen_count', { by: 1 });
        await log.reload();
    }
    return log;
};

module.exports = { findOne, recordListen };
