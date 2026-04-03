const express = require('express');
const router = express.Router();
const lockedVideosController = require('../controllers/lockedVideoController.js');

router.post('/writeLockedVideos',lockedVideosController.writeLockedVideos);
router.get('/getLockedVideos',lockedVideosController.getLockedVideos);

module.exports = router
