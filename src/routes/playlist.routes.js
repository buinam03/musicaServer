const router = require('express').Router();
const playlistController = require('../controllers/playlist.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

// GET
router.get('/getAllPlaylist', playlistController.getAllPlaylist);
router.get('/getPlaylistById/:playlist_id', playlistController.getPlaylistById);
router.get('/getPlaylistsByUserId/:user_id', playlistController.getPlaylistsByUserId);
router.get('/getPlaylistCMS', playlistController.getPlaylistCMS);
router.get('/getAllPlaylistCMS', playlistController.getAllPlaylistCMS);

// POST
router.post('/createNewPlaylist', playlistController.createNewPlaylist);
router.post('/createNewPlaylistNotName', playlistController.createNewPlaylistNotName);
router.post('/addSongToPlaylist', playlistController.addSongToPlaylist);
router.post('/createPlaylistCMS', playlistController.createPlaylistCMS);
router.post('/addSongToPlaylistCMS', playlistController.addSongToPlaylistCMS);

// PUT
router.put('/updatePlaylist/:playlist_id', playlistController.updatePlaylist);

// DELETE
router.delete('/removeSongFromPlaylist', playlistController.removeSongFromPlaylist);
router.delete('/deletePlaylist/:playlist_id', playlistController.deletePlaylist);

module.exports = router;
