const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController.js');

router.get('/list',videoController.getVideos);
router.get('/authorize',videoController.authorize);

module.exports = router;