const express = require('express');
const router = express.Router();

const { writeVideoForDownload, deleteVideoForDownload, getVideoForDownload } = require("../controllers/videoForDownloadController.js");

router.post('/writeVideoForDownload',writeVideoForDownload);
router.post('/deleteVideoForDownload',deleteVideoForDownload);
router.get('/getVideoForDownload',getVideoForDownload);

module.exports = router
