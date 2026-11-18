-- liquibase formatted sql

-- =====================================================================
--  MUSICA - CHANGELOG KHỞI TẠO SCHEMA (MySQL 8.0.16+)
--  Sinh từ các Sequelize model trong musicaServer/src/models.
--
--  Thứ tự:
--    1. Tạo database
--    2. Tạo bảng (PK, NOT NULL, DEFAULT, UNIQUE, CHECK)
--    3. Thêm khóa ngoại (FOREIGN KEY)
--    4. Thêm index phục vụ truy vấn
--
--  Cách chạy:
--    - Liquibase : liquibase --changelog-file=001-init-schema.sql update
--    - MySQL CLI : mysql -u root -p < 001-init-schema.sql
--      (các dòng "-- changeset" / "-- rollback" là comment hợp lệ với MySQL)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. DATABASE
-- ---------------------------------------------------------------------

-- changeset musica:000-create-database
CREATE DATABASE IF NOT EXISTS musica
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE musica;
-- rollback DROP DATABASE IF EXISTS musica;


-- ---------------------------------------------------------------------
-- 2. TABLES
-- ---------------------------------------------------------------------

-- changeset musica:001-create-table-users
CREATE TABLE users (
    id               INT          NOT NULL AUTO_INCREMENT,
    username         VARCHAR(255) NOT NULL,
    email            VARCHAR(255) NOT NULL,
    password         VARCHAR(255) NOT NULL,
    profile_picture  LONGTEXT     NULL,
    header_picture   LONGTEXT     NULL,
    bio              TEXT         NULL,
    is_verified      TINYINT(1)   NOT NULL DEFAULT 0,
    country          VARCHAR(100) NULL,
    province         VARCHAR(100) NULL,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_users          PRIMARY KEY (id),
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email    UNIQUE (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- rollback DROP TABLE users;

-- changeset musica:002-create-table-achievements
CREATE TABLE achievements (
    id               INT          NOT NULL AUTO_INCREMENT,
    name             VARCHAR(255) NOT NULL,
    description      TEXT         NOT NULL,
    condition_type   ENUM('followers', 'songs_uploaded', 'plays', 'likes') NOT NULL,
    condition_value  INT          NOT NULL,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_achievements PRIMARY KEY (id),
    CONSTRAINT ck_achievements_condition_value CHECK (condition_value >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- rollback DROP TABLE achievements;

-- changeset musica:003-create-table-user-achievements
-- Lưu ý: cột "userId" viết camelCase để khớp với model UserAchievement.
CREATE TABLE user_achievements (
    id              INT      NOT NULL AUTO_INCREMENT,
    userId          INT      NOT NULL,
    achievement_id  INT      NOT NULL,
    achieved_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_user_achievements PRIMARY KEY (id),
    CONSTRAINT uq_user_achievements_user_achievement UNIQUE (userId, achievement_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- rollback DROP TABLE user_achievements;

-- changeset musica:004-create-table-songs
CREATE TABLE songs (
    id           INT          NOT NULL AUTO_INCREMENT,
    title        VARCHAR(255) NOT NULL,
    artwork      VARCHAR(255) NULL,
    uploader_id  INT          NOT NULL,
    is_public    TINYINT(1)   NOT NULL DEFAULT 1,
    path         VARCHAR(500) NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_songs PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- rollback DROP TABLE songs;

-- changeset musica:005-create-table-songs-detail
-- Quan hệ 1-1 với songs (Song.hasOne(SongDetail)) => song_id UNIQUE.
-- genre là id thể loại lấy từ Deezer API, không có bảng genre nên không đặt FK.
CREATE TABLE songs_detail (
    id        INT  NOT NULL AUTO_INCREMENT,
    song_id   INT  NOT NULL,
    bio       TEXT NULL,
    duration  INT  NOT NULL,
    genre     INT  NULL,
    likes     INT  NOT NULL DEFAULT 0,
    plays     INT  NOT NULL DEFAULT 0,
    CONSTRAINT pk_songs_detail         PRIMARY KEY (id),
    CONSTRAINT uq_songs_detail_song_id UNIQUE (song_id),
    CONSTRAINT ck_songs_detail_duration CHECK (duration >= 0),
    CONSTRAINT ck_songs_detail_likes    CHECK (likes >= 0),
    CONSTRAINT ck_songs_detail_plays    CHECK (plays >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- rollback DROP TABLE songs_detail;

-- changeset musica:006-create-table-song-artists
CREATE TABLE song_artists (
    id         INT NOT NULL AUTO_INCREMENT,
    song_id    INT NOT NULL,
    artist_id  INT NOT NULL,
    CONSTRAINT pk_song_artists PRIMARY KEY (id),
    CONSTRAINT uq_song_artists_song_artist UNIQUE (song_id, artist_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- rollback DROP TABLE song_artists;

-- changeset musica:007-create-table-song-comments
-- parent_id trỏ về chính bảng này (reply comment).
CREATE TABLE song_comments (
    id          INT      NOT NULL AUTO_INCREMENT,
    song_id     INT      NOT NULL,
    user_id     INT      NOT NULL,
    content     TEXT     NOT NULL,
    parent_id   INT      NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_song_comments PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- rollback DROP TABLE song_comments;

-- changeset musica:008-create-table-follows
-- Không dùng CHECK (follower_id <> following_id) vì MySQL cấm CHECK trên cột
-- có FK ON DELETE CASCADE (lỗi 3823). Việc chặn tự follow do service xử lý.
CREATE TABLE follows (
    id            INT      NOT NULL AUTO_INCREMENT,
    follower_id   INT      NOT NULL,
    following_id  INT      NOT NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_follows PRIMARY KEY (id),
    CONSTRAINT uq_follows_follower_following UNIQUE (follower_id, following_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- rollback DROP TABLE follows;

-- changeset musica:009-create-table-notifications
CREATE TABLE notifications (
    id          INT          NOT NULL AUTO_INCREMENT,
    user_id     INT          NOT NULL,
    title       VARCHAR(255) NOT NULL,
    message     TEXT         NULL,
    link        VARCHAR(255) NULL,
    type        ENUM('like', 'follow', 'comment', 'system') NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_notifications PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- rollback DROP TABLE notifications;

-- changeset musica:010-create-table-messages
-- room_id dạng "<idNhỏ>_<idLớn>", sinh bởi utils/roomId.js.
CREATE TABLE messages (
    id          INT          NOT NULL AUTO_INCREMENT,
    send_id     INT          NOT NULL,
    receive_id  INT          NOT NULL,
    room_id     VARCHAR(255) NOT NULL,
    message     TEXT         NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_messages PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- rollback DROP TABLE messages;

-- changeset musica:011-create-table-likes
CREATE TABLE likes (
    id          INT      NOT NULL AUTO_INCREMENT,
    user_id     INT      NOT NULL,
    song_id     INT      NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_likes PRIMARY KEY (id),
    CONSTRAINT uq_likes_user_song UNIQUE (user_id, song_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- rollback DROP TABLE likes;

-- changeset musica:012-create-table-playlists
-- creator_id NULL cho playlist CMS (isCms = 1). idGenre là id thể loại Deezer.
CREATE TABLE playlists (
    id          INT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(255) NULL,
    artwork     VARCHAR(255) NULL,
    creator_id  INT          NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isCms       TINYINT(1)   NOT NULL DEFAULT 0,
    idGenre     INT          NULL,
    CONSTRAINT pk_playlists PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- rollback DROP TABLE playlists;

-- changeset musica:013-create-table-playlist-song
-- Bảng trung gian n-n Playlist <-> Song. Model không có cột id nên
-- Sequelize dùng khóa chính kép (playlist_id, song_id).
CREATE TABLE playlist_song (
    playlist_id  INT      NOT NULL,
    song_id      INT      NOT NULL,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_playlist_song PRIMARY KEY (playlist_id, song_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- rollback DROP TABLE playlist_song;

-- changeset musica:014-create-table-user-song-logs
-- Lịch sử nghe: mỗi cặp (user, song) một dòng, cộng dồn listen_count.
CREATE TABLE user_song_logs (
    id                INT      NOT NULL AUTO_INCREMENT,
    user_id           INT      NOT NULL,
    song_id           INT      NOT NULL,
    listen_count      INT      NOT NULL DEFAULT 1,
    last_listened_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_user_song_logs PRIMARY KEY (id),
    CONSTRAINT uq_user_song_logs_user_song UNIQUE (user_id, song_id),
    CONSTRAINT ck_user_song_logs_listen_count CHECK (listen_count >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- rollback DROP TABLE user_song_logs;

-- changeset musica:015-create-table-refreshtokens
-- Cột "refreshToken", "createdAt" viết camelCase để khớp model RefreshToken.
CREATE TABLE refreshtokens (
    id            INT          NOT NULL AUTO_INCREMENT,
    user_id       INT          NOT NULL,
    refreshToken  VARCHAR(255) NOT NULL,
    createdAt     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_refreshtokens PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- rollback DROP TABLE refreshtokens;


-- ---------------------------------------------------------------------
-- 3. FOREIGN KEYS
--    Xóa user / song / playlist => xóa dây chuyền dữ liệu phụ thuộc (CASCADE),
--    vì song.service chỉ xóa songs_detail + song_artists trước khi xóa song.
-- ---------------------------------------------------------------------

-- changeset musica:100-fk-user-achievements
ALTER TABLE user_achievements
    ADD CONSTRAINT fk_user_achievements_user
        FOREIGN KEY (userId) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_user_achievements_achievement
        FOREIGN KEY (achievement_id) REFERENCES achievements (id)
        ON DELETE CASCADE ON UPDATE CASCADE;
-- rollback ALTER TABLE user_achievements DROP FOREIGN KEY fk_user_achievements_user, DROP FOREIGN KEY fk_user_achievements_achievement;

-- changeset musica:101-fk-songs
ALTER TABLE songs
    ADD CONSTRAINT fk_songs_uploader
        FOREIGN KEY (uploader_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE;
-- rollback ALTER TABLE songs DROP FOREIGN KEY fk_songs_uploader;

-- changeset musica:102-fk-songs-detail
ALTER TABLE songs_detail
    ADD CONSTRAINT fk_songs_detail_song
        FOREIGN KEY (song_id) REFERENCES songs (id)
        ON DELETE CASCADE ON UPDATE CASCADE;
-- rollback ALTER TABLE songs_detail DROP FOREIGN KEY fk_songs_detail_song;

-- changeset musica:103-fk-song-artists
ALTER TABLE song_artists
    ADD CONSTRAINT fk_song_artists_song
        FOREIGN KEY (song_id) REFERENCES songs (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_song_artists_artist
        FOREIGN KEY (artist_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE;
-- rollback ALTER TABLE song_artists DROP FOREIGN KEY fk_song_artists_song, DROP FOREIGN KEY fk_song_artists_artist;

-- changeset musica:104-fk-song-comments
ALTER TABLE song_comments
    ADD CONSTRAINT fk_song_comments_song
        FOREIGN KEY (song_id) REFERENCES songs (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_song_comments_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_song_comments_parent
        FOREIGN KEY (parent_id) REFERENCES song_comments (id)
        ON DELETE CASCADE ON UPDATE CASCADE;
-- rollback ALTER TABLE song_comments DROP FOREIGN KEY fk_song_comments_song, DROP FOREIGN KEY fk_song_comments_user, DROP FOREIGN KEY fk_song_comments_parent;

-- changeset musica:105-fk-follows
ALTER TABLE follows
    ADD CONSTRAINT fk_follows_follower
        FOREIGN KEY (follower_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_follows_following
        FOREIGN KEY (following_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE;
-- rollback ALTER TABLE follows DROP FOREIGN KEY fk_follows_follower, DROP FOREIGN KEY fk_follows_following;

-- changeset musica:106-fk-notifications
ALTER TABLE notifications
    ADD CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE;
-- rollback ALTER TABLE notifications DROP FOREIGN KEY fk_notifications_user;

-- changeset musica:107-fk-messages
ALTER TABLE messages
    ADD CONSTRAINT fk_messages_sender
        FOREIGN KEY (send_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_messages_receiver
        FOREIGN KEY (receive_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE;
-- rollback ALTER TABLE messages DROP FOREIGN KEY fk_messages_sender, DROP FOREIGN KEY fk_messages_receiver;

-- changeset musica:108-fk-likes
ALTER TABLE likes
    ADD CONSTRAINT fk_likes_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_likes_song
        FOREIGN KEY (song_id) REFERENCES songs (id)
        ON DELETE CASCADE ON UPDATE CASCADE;
-- rollback ALTER TABLE likes DROP FOREIGN KEY fk_likes_user, DROP FOREIGN KEY fk_likes_song;

-- changeset musica:109-fk-playlists
ALTER TABLE playlists
    ADD CONSTRAINT fk_playlists_creator
        FOREIGN KEY (creator_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE;
-- rollback ALTER TABLE playlists DROP FOREIGN KEY fk_playlists_creator;

-- changeset musica:110-fk-playlist-song
ALTER TABLE playlist_song
    ADD CONSTRAINT fk_playlist_song_playlist
        FOREIGN KEY (playlist_id) REFERENCES playlists (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_playlist_song_song
        FOREIGN KEY (song_id) REFERENCES songs (id)
        ON DELETE CASCADE ON UPDATE CASCADE;
-- rollback ALTER TABLE playlist_song DROP FOREIGN KEY fk_playlist_song_playlist, DROP FOREIGN KEY fk_playlist_song_song;

-- changeset musica:111-fk-user-song-logs
ALTER TABLE user_song_logs
    ADD CONSTRAINT fk_user_song_logs_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_user_song_logs_song
        FOREIGN KEY (song_id) REFERENCES songs (id)
        ON DELETE CASCADE ON UPDATE CASCADE;
-- rollback ALTER TABLE user_song_logs DROP FOREIGN KEY fk_user_song_logs_user, DROP FOREIGN KEY fk_user_song_logs_song;

-- changeset musica:112-fk-refreshtokens
ALTER TABLE refreshtokens
    ADD CONSTRAINT fk_refreshtokens_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE;
-- rollback ALTER TABLE refreshtokens DROP FOREIGN KEY fk_refreshtokens_user;


-- ---------------------------------------------------------------------
-- 4. INDEXES (theo các truy vấn trong src/repositories)
--    Cột FK đã có index tự động; dưới đây là index bổ sung.
-- ---------------------------------------------------------------------

-- changeset musica:200-idx-songs
CREATE INDEX idx_songs_uploader_created ON songs (uploader_id, created_at);
CREATE INDEX idx_songs_public_created   ON songs (is_public, created_at);
-- rollback DROP INDEX idx_songs_uploader_created ON songs;
-- rollback DROP INDEX idx_songs_public_created ON songs;

-- changeset musica:201-idx-songs-detail
CREATE INDEX idx_songs_detail_genre ON songs_detail (genre);
-- rollback DROP INDEX idx_songs_detail_genre ON songs_detail;

-- changeset musica:202-idx-song-comments
CREATE INDEX idx_song_comments_song_created ON song_comments (song_id, created_at);
-- rollback DROP INDEX idx_song_comments_song_created ON song_comments;

-- changeset musica:203-idx-notifications
CREATE INDEX idx_notifications_user_created ON notifications (user_id, created_at);
-- rollback DROP INDEX idx_notifications_user_created ON notifications;

-- changeset musica:204-idx-messages
CREATE INDEX idx_messages_room_created ON messages (room_id, created_at);
-- rollback DROP INDEX idx_messages_room_created ON messages;

-- changeset musica:205-idx-likes
CREATE INDEX idx_likes_user_created ON likes (user_id, created_at);
-- rollback DROP INDEX idx_likes_user_created ON likes;

-- changeset musica:206-idx-playlists
CREATE INDEX idx_playlists_cms_genre      ON playlists (isCms, idGenre);
CREATE INDEX idx_playlists_creator_created ON playlists (creator_id, created_at);
-- rollback DROP INDEX idx_playlists_cms_genre ON playlists;
-- rollback DROP INDEX idx_playlists_creator_created ON playlists;

-- changeset musica:207-idx-user-song-logs
CREATE INDEX idx_user_song_logs_user_last ON user_song_logs (user_id, last_listened_at);
-- rollback DROP INDEX idx_user_song_logs_user_last ON user_song_logs;

-- changeset musica:208-idx-refreshtokens
-- Không UNIQUE: hai lần login cùng giây có thể sinh JWT trùng nhau.
CREATE INDEX idx_refreshtokens_token ON refreshtokens (refreshToken);
-- rollback DROP INDEX idx_refreshtokens_token ON refreshtokens;
