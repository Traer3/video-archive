const logService = require('../services/logService.js');

const ignoreList = [
    '/addLog',
    '/logs',
    '/writeFailed',
    '/writeLockedVideos',
    '/writeVideoForDownload',
    '/writeLikes'
];

const requestLogger = (req,res,next) => {
    const oldJson = res.json;
    
    res.json = function (data){
        if(!ignoreList.includes(req.path)){
            const logMsg = `Path: ${req.path} | Status: ${res.statusCode}`;
            logService.addLog({type:"ExpressLogs", message: logMsg})
                .catch(err => console.error("Middleware logging error: ",err));
        }
        return oldJson.call(this, data);
    };
    next();
};

module.exports = requestLogger;