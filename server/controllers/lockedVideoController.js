const lockedVideosService = require('../services/lockedVideoService.js');

exports.writeLockedVideos = async(req,res) => {
    try{
        const {scriptName} = req.body;
        if(!scriptName) return(res.status(400).json({message: "Missing script name"}));
        const write = await lockedVideosService.writeLockedVideos(req.body);
        res.status(200).json({message:  '✅ Video written successfully', data: write});
    }catch(err){
        res.status(500).json({error:"Error table lockedVideos ", err});
    }
};

exports.getLockedVideos = async (req,res) => {
    try{
        const lockedVideos = await lockedVideosService.getLockedVideos();
        res.json(lockedVideos);
    }catch(err){
        res.status(500).json({error:"Table lockedVideos error",err})
    }
}

