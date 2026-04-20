const authorizationService = require('../services/authorizationService.js')

exports.loadCredentials = async (req,res) =>{
    try{
        const result = await authorizationService.loadCredentials();
        console.log("loadCredentials : ", result.status)
        if(result.status){
            res.status(200).json({
                message:'✅ Current token works!',
                data: result.status
            });
        }else{
            res.status(400).json({
                message:'Token missing',
                data: result.status
            })
        }
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
    const answer = req.params
    console.log("answer: ",answer.url);
    let parsed

    try{
        parsed = new URL(answer.url);
        console.log("URL working!");
    }catch(err){
        res.status(500).json({error: `❌ Invalid url: \n ${answer.url}`});
        return null;
    }

    const codeParam = parsed.searchParams.get("code");
    if(!codeParam){
        console.log("Code parameter not found");
        res.status(500).json({error: `❌ Code parameter not found in url: \n ${parsed}`});
        return null;
    }
    try{
        const code = codeParam.trim()
        const finishAuth = await authorizationService.finishAuth(code);
        res.status(200).json({
            message:'📝 Require FULL URL!',
            data: finishAuth
        });

    }catch(err){
        console.log("Error parsing URL",err);
        res.status(500).json({error: "❌ Failed to get authorization url \n ",err});
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