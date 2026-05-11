const QRCode = require('qrcode')
exports.getQRCode = async () => {
    const URL = 'http://192.168.0.8:3001/api/auth/QRCode';
    try{
        const qrAsText = await QRCode.toString(URL,{
            type: 'terminal',
            small: true,
            margin: 1,
            errorCorrectionLevel: 'L',
        });
        console.log(qrAsText);
        return qrAsText;
    }catch(err){
        console.error(`Error while generating QR code ${err}`)
    }
};

