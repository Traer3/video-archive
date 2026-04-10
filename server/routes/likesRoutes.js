const express = require('express');
const router = express.Router();

const { writeLikes, deleteLikes, getLikes } = require("../controllers/likesController.js");

router.post('/writeLikes',writeLikes);
router.post('/deleteLikes',deleteLikes);
router.get('/getLikes',getLikes);

module.exports = router;