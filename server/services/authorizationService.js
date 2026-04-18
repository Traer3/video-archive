const fsPromises = require("fs").promises;
const path = require('path');
const {google} = require('googleapis');
const {UserRefreshClient} = require('google-auth-library');
const { readMyFile, writeInfo, deleteFile } = require('./toolsService.js');

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_PATH = path.join(__dirname, '../middleware/auth/token.json');
const CREDENTIALS_PATH = path.join(__dirname, '../middleware/auth/credentials.json');


exports.loadCredentials = async () => {
    const existing = await loadCredentials();
    if(existing){
        console.log('✅ Current token works!');
        return true;
    };
};

exports.getAuthUrl = async () =>{
    const authUrl = await getAuthUrl();
    return authUrl;
};

exports.finishAuth = async (code) =>{
    console.log("finishAuth CODE : ",code)
    return await finishAuth(code);
};

//exports.saveToken = async (content,client) =>{return await saveToken(content,client);}

exports.deleteToken = async () =>{
    try{
        await deleteFile(TOKEN_PATH)
        console.log(`Successfuly deleted TOKEN`);
    }catch(err){
        console.log(`Error in deleteToken : ${err}`);
        return null;
    };
};

exports.checkToken = async () =>{
    try{
        await fsPromises.access(TOKEN_PATH, fsPromises.constants.F_OK)
        return true;
    }catch(err){
        return false;
    };
};


async function loadCredentials() {
    try{
        const content = await readMyFile(TOKEN_PATH);
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


async function getAuthUrl() {
    try{
        const content = await readMyFile(CREDENTIALS_PATH);
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
        return authUrl;
    }catch(err){
        console.log(`Error in getAuthUrl : ${err}`);
        return null;
    }
};

async function finishAuth(code) {
    console.log("Code : ",code)
    const content = await readMyFile(CREDENTIALS_PATH);
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
        return console.log('✅ Authorization completed, TOKEN saved!')

        //return oAuth2Client;
    }catch(err){
        console.error(`❌ Error exchanging code for token: \n${err.message}`);
        return null;
        //process.exit(1);
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
        return true;
    }catch(err){
        console.log(`Error in saveToken : ${err}`);
        return null;
    };
};

