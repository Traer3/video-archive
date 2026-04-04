const express = require('express');
const router = express.Router();
const videoForDownloadController = require('../controllers/videoForDownloadController.js');

router.post('/writeVideoForDownload',videoForDownloadController.writeVideoForDownload);
router.post('/deleteVideoForDownload',videoForDownloadController.deleteVideoForDownload);
router.get('/getVideoForDownload',videoForDownloadController.getVideoForDownload);

module.exports = router
