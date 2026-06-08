const express = require('express');
const { videoSorter } = require('../DevTools/VideoSorter');
const { importAll } = require('../DevTools/ImportAllVideos');
const { GetDuplicate } = require('../DevTools/GetDuplicate');
const router = express.Router();

router.get('/sortVideos',videoSorter);
router.get('/importAll',importAll);
//router.get('/getDuplicates',GetDuplicate);

module.exports = router;