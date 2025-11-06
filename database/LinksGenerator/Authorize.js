const fs = require('fs');
const path = require('path');
const readline = require('readline')
const {google} = require('googleapis');
const {UserRefreshClient} = require('google-auth-library')

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

let authorizePromise = null;

async function loadCredentials() {
    try{
        const content = fs.readFileSync(TOKEN_PATH, 'utf-8');
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
        return null;
    }
}

async function saveCredentials(client) {
    const content = fs.readFileSync(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    fs.writeFileSync(TOKEN_PATH, payload);
}

async function authorize() {
    if(authorizePromise) return authorizePromise;
    authorizePromise = (async ()=>{
        let client = await loadCredentials()
        if(client){
            try{
                await client.getAccessToken();
                return client;
            }catch(err){
                console.log("🔁 Token deprecated, updating...");
            }
        }
        const content = fs.readFileSync(CREDENTIALS_PATH);
        const credentials = JSON.parse(content);
        const {client_secret, client_id, redirect_uris} = credentials.installed;
    
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]
        );
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });

        //Flag 1
        console.log(`🔑 Log in using google:\n ${authUrl}`);

        //Flag 2
        const readL = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        const code = await new Promise((resolve) => {
            readL.question('Enter the code from that page here: ', (answer)=>{
                readL.close();
                resolve(answer.trim());
            });
        });
        if(!code){
            console.error('❌ No code =(');
            process.exit(1);
        }
        const {tokens} = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
    
        await saveCredentials(oAuth2Client);
    
        return oAuth2Client;
    })();
    return authorizePromise;
}

module.exports = {authorize}
