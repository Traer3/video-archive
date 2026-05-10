const express = require('express');
const router = express.Router();
const { loadCredentials, getAuthUrl, finishAuth, deleteToken, checkToken, QRCodeURL } = require('../controllers/authorizeController');

router.get('/loadCredentials', loadCredentials);
router.get('/getAuthUrl', getAuthUrl);
router.get('/finishAuth/', finishAuth);
router.get('/QRCode',QRCodeURL)

// только это ⭣ использовать 
router.get('/deleteToken', deleteToken);
router.get('/checkToken', checkToken);

module.exports = router;