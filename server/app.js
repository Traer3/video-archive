const express = require("express");
const cors = require("cors");
const videoRoutes = require('./routes/videoRoutes.js');
const videoService = require('./services/videoService.js');

const app = express();
app.use(cors());
app.use(express.json());

const ignoreList = ['/addLog','/logs','/writeFailed','/writeLockedVideos','/writeVideoForDownload','/writeLikes']
app.use((req, res, next)=>{
    const oldJson = res.json;

    res.json = function (data){
        if(!ignoreList.includes(req.path)){
            videoService.saveLog("ExpressLogs",`Path: ${req.path} | Status: ${res.statusCode}`)
                .catch(console.error);
        }
        return oldJson.call(this, data);
    };

    next();
});

app.use('/api/videos',videoRoutes);

module.exports = app;