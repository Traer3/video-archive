const videoForDownloadService = require('../services/videoForDownloadService.js');

exports.writeVideoForDownload = async(req,res) => {
    try{
        const {videoName,videoUrl} = req.body;
        if(!videoName || !videoUrl){
            return(res.status(400).json({message: "Missing video name or url"}));
        };
        const write = await videoForDownloadService.writeVideoForDownload(req.body);
        res.status(200).json({ message:  '✅ Video written successfully', data: write});
    }catch(err){
        res.status(500).json({error:"Error table lockedVideos ", err});
    };
};

exports.deleteVideoForDownload = async(req,res) => {
    try{
        await videoForDownloadService.deleteVideoForDownload();
        res.status(200).json({
            success:true,
            message:'Table videofordownload has been reseted'
        });
    }catch(err){
        res.status(500).json({error:"Table videoForDownload error",err})
    }
};

exports.getVideoForDownload = async(req,res) => {
    try{
        const videoForDownload = await videoForDownloadService.getVideoForDownload();
        res.json(videoForDownload);
    }catch(err){
        res.status(500).json({error:"Table videoForDownload error",err});
    }
}