const express = require('express');
const router = express.Router();

const { writeFailed, getFailed } = require("../controllers/failedController.js");

router.post('/writeFailed',writeFailed);
router.get('/getFailed',getFailed);

module.exports = router;