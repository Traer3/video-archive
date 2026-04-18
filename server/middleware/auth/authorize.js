const fsPromises = require("fs").promises;
const path = require('path');
const {google} = require('googleapis');
const {UserRefreshClient} = require('google-auth-library');
const readline = require('readline')
const { readMyFile, writeInfo, deleteFile } = require("../../services/toolsService");

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

exports.main = async () => {
    const content = await readMyFile(CREDENTIALS_PATH);
    /////мейн 
    //Нужна авторизация через консоль 
    // Авторизация  через приложение
};

exports.consoleAuthorization = async () => {
    console.log("📥 Authorization via console... ");
    const content = await readMyFile(CREDENTIALS_PATH);
    const existing = await loadCredentials(content);

    try{
        if(existing){
            console.log('✅ Current token works!');
            return existing;
        };
        const authUrl = await getAuthUrl(content);
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

        await finishAuth(content,code);
        
    }catch(err){
        console.log(`Error in consoleAuthorization : ${err}`)
        return null;
    }

}

async function loadCredentials(content) {
    try{
        const credentials = JSON.parse(content);
        const client = new UserRefreshClient({
            clientId: credentials.client_id,
            clientSecret: credentials.client_secret,
            refreshToken: credentials.refresh_token,
        });
    
        try{
            await client.refreshAccessToken();
            return client;
        }catch(err){
            console.warn('⚠️ Token deprecated')
            return null;
        }
    }catch(err){
        console.log(`Error in loadCredentials : ${err}`)
        return null;
    };
};


async function getAuthUrl(content) {
    //const content = await readMyFile(CREDENTIALS_PATH);
    try{
        const credentials = JSON.parse(content);
        const {client_secret, client_id, redirect_uris} = credentials.web;
            
        const redirectUri = redirect_uris[0];
    
        const oAuth2Client = new google.auth.OAuth2(
                client_id, client_secret, redirectUri
        );
    
        const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
                prompt: 'consent'
        });
        //console.log(`Go to this URL ${authUrl}`);
        return authUrl;
    }catch(err){
        console.log(`Error in getAuthUrl : ${err}`);
        return null;
    }
};

async function finishAuth(content,code) {
    const credentials = JSON.parse(content);
    const {client_secret, client_id, redirect_uris} = credentials.web;
        
    const redirectUri = redirect_uris[0];

    const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirectUri
    );
    try{
        const {tokens} = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        
        await saveToken(content,oAuth2Client);
        console.log('✅ Authorization completed, TOKEN saved!')

        return oAuth2Client;
    }catch(err){
        console.error(`❌ Error exchanging code for token: \n${err.message}`);
        process.exit(1);
    }
    
}

async function saveToken(content,client) {
    try{
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });
        await writeInfo(TOKEN_PATH,payload);
    }catch(err){
        console.log(`Error in saveToken : ${err}`);
        return;
    };
};

async function deleteToken() {
    try{
        await deleteFile(TOKEN_PATH)
        console.log(`Successfuly deleted TOKEN`);
    }catch(err){
        console.log(`Error in deleteToken : ${err}`);
        return null;
    };
};

async function checkToken() {
    try{
        await fsPromises.access(TOKEN_PATH, fsPromises.constants.F_OK)
        return true;
    }catch(err){
        return false;
    }
};