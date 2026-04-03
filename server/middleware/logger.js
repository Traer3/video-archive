const videoService = require('../services/videoService.js');

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
            videoService.saveLog("ExpressLogs",logMsg)
                .catch(err => console.error("Middleware logging error: ",err));
        }
        return oldJson.call(this, data);
    };
    next();
};

module.exports = requestLogger;