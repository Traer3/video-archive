const authorizationService = require('../services/authorizationService.js')

exports.loadCredentials = async (req,res) =>{
    try{
        const loadCredentials = await authorizationService.loadCredentials();
        res.status(200).json({
            message:'✅ Current token works!',
            data: loadCredentials
        });
    }catch(err){
        res.status(500).json({error: "❌ Failed to load credentials\n",err});
    };
};
exports.getAuthUrl = async (req,res) =>{
    try{
        const getAuthUrl = await authorizationService.getAuthUrl();
        res.status(200).json({
            message:'✅ Fetching url for authorization!',
            data: getAuthUrl
        });
    }catch(err){
        res.status(500).json({error: "❌ Failed to get authorization url\n",err});
    }
};
exports.finishAuth = async (req,res) =>{
    const answer = req.body
    try{
        const parsed = new URL(answer);
        const codeParam = parsed.searchParams.get("code");
        if(!codeParam){
            console.log("Code parameter not found");
            return;
        }
        const code = codeParam.trim()

        const finishAuth = await authorizationService.finishAuth(code);
        res.status(200).json({
            message:'📝 Require FULL URL!',
            data: finishAuth
        });

    }catch(err){
        console.log("Error parsing URL",err);
        res.status(500).json({error: "❌ Failed to get authorization url\n",err});
    };
};

exports.deleteToken = async(req,res) => {
    try{
        const deleteToken = await authorizationService.deleteToken();
        res.status(200).json({
            message:'🗑️ Deleting old token!',
            data: deleteToken
        });
    }catch(err){
        res.status(500).json({error: "❌ Error while deleting old token\n",err});
    };
};

exports.checkToken = async(req,res) => {
    try{
        const checkToken = await authorizationService.checkToken();
        res.status(200).json({
            message:'🔄 Cheking tokin health...',
            data: checkToken
        });
    }catch(err){
        res.status(500).json({error: "❌ Error while Cheking tokin health\n",err});
    };
};