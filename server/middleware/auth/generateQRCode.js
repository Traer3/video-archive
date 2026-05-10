const QRCode = require('qrcode')
exports.getQRCode = async () => {
    const URL = 'http://192.168.0.8:3001/api/auth/QRCode';
    return QRCode.toString(URL, {
        type: 'terminal',
        small: true,
        margin: 1,
        errorCorrectionLevel: 'L',
    }, function (err, url) {
        if (err) return console.error(err);
        console.log(url);
    });
}