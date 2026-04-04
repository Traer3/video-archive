const likesService = require('../services/likesService.js');

exports.writeLikes = async(req,res) => {
    try{
        const {videoName,videoUrl} = req.body;
        if(!videoName || !videoUrl){
            return(res.status(400).json({message: "Missing video name or url"}));
        };
        const write = await likesService.writeLikes(req.body);
        res.status(200).json({message: '✅ Likes written ',data: write});
    }catch(err){
        res.status(500).json({error:"Error table likes ", err});
    };
};

exports.deleteLikes = async(req,res) => {
    try{
        await likesService.deleteLikes();
        res.status(200).json({
            success:true,
            message:'Table likes has been reseted'
        });
    }catch(err){
        res.status(500).json({error:"Table videoForDownload error",err})
    };
};

exports.getLikes = async(req,res) =>{
    try{
        const likes = likesService.getLikes();
        res.json(likes);
    }catch(err){
        res.status(500).json({error:"Table likes error",err})
    }
}