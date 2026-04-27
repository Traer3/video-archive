const express = require('express');
const router = express.Router();
const { loadCredentials, getAuthUrl, finishAuth, deleteToken, checkToken } = require('../controllers/authorizeController');

router.get('/loadCredentials', loadCredentials);
router.get('/getAuthUrl', getAuthUrl);
router.get('/finishAuth/', finishAuth);

// только это ⭣ использовать 
router.get('/deleteToken', deleteToken);
router.get('/checkToken', checkToken);

module.exports = router;