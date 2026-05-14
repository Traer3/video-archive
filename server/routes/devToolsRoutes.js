const express = require('express');
const { videoSorter } = require('../DevTools/VideoSorter');
const { importAll } = require('../DevTools/ImportAllVideos');
const router = express.Router();

router.get('/sortVideos',videoSorter);
router.get('/importAll',importAll);

module.exports = router;