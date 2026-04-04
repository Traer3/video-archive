const express = require('express');
const router = express.Router();
const likesController = require('../controllers/likesController.js');

router.post('/writeLikes',likesController.writeLikes);
router.post('/deleteLikes',likesController.deleteLikes);
router.get('/getLikes',likesController.getLikes);

module.exports = router;