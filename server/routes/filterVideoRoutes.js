const express = require('express');
const router = express.Router();
const filterVideoController = require('../controllers/filterVideoController.js');

router.post('/filterVideo',filterVideoController.filterVideo);

module.exports = router;