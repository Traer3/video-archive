const failedService = require('../services/failedService.js');

exports.writeFailed = async (req, res) => {
    try{
        const {scriptName} = req.body;
        if(!scriptName) return(res.status(400).json({message: "Missing script name"}));
        
        const write = await failedService.writeFailed(req.body);
        res.status(200).json({ message:  '✅ Error written successfully', data: write});
    }catch(err){
        res.status(500).json({error:"Error table failed ", err});
    }
};

exports.getFailed = async (req,res) => {
    try{
        const errors = await failedService.getFailed();
        res.json(errors);
    }catch(err){
        res.status(500).json({error:"Table failed error",err})
    }
}