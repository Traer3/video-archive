const express = require('express');
const router = express.Router();
const failedController = require('../controllers/failedController.js');

router.post('/writeFailed',failedController.writeFailed);
router.get('/getFailed',failedController.getFailed);

module.exports = router;