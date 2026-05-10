const QRCode = require('qrcode')
exports.getQRCode = async (URL) =>{
   return QRCode.toString(URL,{
                type: 'terminal', 
                small:true,
                margin:1,
                scale:1,
                width:1,
                errorCorrectionLevel:'L',
            },function(err, url){
                if(err) return console.error(err);
                console.log(url);
    });
}