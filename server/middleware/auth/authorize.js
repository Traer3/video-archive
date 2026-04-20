const readline = require('readline')
const { loadCredentials, getAuthUrl, finishAuth } = require("../../services/authorizationService");

exports.consoleAuthorization = async () => {
    console.log("📥 Authorization via console... ");
    const existing = await loadCredentials()

    if(existing.status){
        return existing.client
    }else{
        try{
            const authUrl = await getAuthUrl();
            console.log(` \nPlease visit: ${authUrl}\n `);
    
            const readL = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });
            
            const code = await new Promise((resolve)=>{
                readL.question('Enter FULL URL from that page here: ',(answer)=>{
                    readL.close();
                    try{
                        const parsed = new URL(answer);
                        const codeParam = parsed.searchParams.get("code");
                        if(!codeParam){
                            console.log("Code parameter not found");
                            return;
                        }
                        resolve(codeParam.trim());
            
                    }catch(err){
                        console.log("Error parsing URL",err)
                    };
                });
            });
            await finishAuth(code);
        }catch(err){
            console.log(`Error in consoleAuthorization : ${err}`)
            return null;
        };
    }
};
