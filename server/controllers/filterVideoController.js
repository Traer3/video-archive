const filterVideo = require('../services/filterVideoService.js');

exports.filterVideo = async(req,res) => {
    try{
        const {id, state} = req.body;
        if(!id || !state) {
            return(res.status(400).json({message: "Missing id or invalid status"}));
        };
        const write = await filterVideo.filterVideo(req.body);
        res.status(200).json({
            message:'✅ Filtered successfully',
            data: write
        });
    }catch(err){
        res.status(500).json({error:"Error changing state ", err});
    };
};
