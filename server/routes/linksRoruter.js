const express = require('express');
const router = express.Router();
const { writeLinks, getLinks, lockedVideo } = require('../services/linksService');

router.post('/writeLinks',writeLinks);
router.get('/getLinks',getLinks);
router.post('/lockedVideo',lockedVideo);

module.exports = router;