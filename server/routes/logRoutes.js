const express = require('express');
const router = express.Router();

const { addLog, getLogs } = require("../controllers/logController.js");

router.post('/addLog',addLog);
router.get('/getLogs',getLogs);

module.exports = router;