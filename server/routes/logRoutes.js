const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController.js');

router.post('/addLog',logController.addLog);
router.get('/getLogs',logController.getLogs);

module.exports = router;