const express = require('express');
const router = express.Router();

const { writeLockedVideos, getLockedVideos } = require("../controllers/lockedVideoController.js");

router.post('/writeLockedVideos',writeLockedVideos);
router.get('/getLockedVideos',getLockedVideos);

module.exports = router
