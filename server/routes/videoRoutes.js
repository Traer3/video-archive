const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController.js');

router.get('/videos',videoController.getVideos);
router.get('/videoList',videoController.getVideoList);
//router.get('/authorize',videoController.authorize);

router.post('/filterVideo',videoController.filterVideo);
router.post('/deleteVideo',videoController.deletedVideo);
router.post('/importVideo',videoController.importVideo);
router.post('/saveVidDuration',videoController.saveVidDuration);
router.post('/saveUniqueData',videoController.saveUniqueData);


module.exports = router;