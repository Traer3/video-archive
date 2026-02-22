const fs = require('fs');
const fsPromises = require("fs").promises
const path = require('path');
const readline = require('readline')
const {google} = require('googleapis');
const {UserRefreshClient} = require('google-auth-library');
const http = require('http');
const { unlink } = require('fs/promises');


const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

let authorizePromise = null;

const [,, command, maybeCode] = process.argv;

async function readMyFile(filePath) {
    try{
        const content = await fsPromises.readFile(filePath,'utf-8');
        return content
    }catch(err){
        console.error(`❌Error reading file ${filePath} `,err.message)
        return null;
    }
}

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
        return null;
    }
}

async function saveCredentials(client) {
    const content = await readMyFile(CREDENTIALS_PATH)
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    try{
        await fsPromises.writeFile(TOKEN_PATH,payload);
    }catch(err){
        console.error("Error saving credentials");
        return;
    }
}

async function getAuthUrl() {
    const content = await readMyFile(CREDENTIALS_PATH)
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
};

async function finishAuth(code) {
    const content = await readMyFile(CREDENTIALS_PATH)
    const credentials = JSON.parse(content);
    const {client_secret, client_id, redirect_uris} = credentials.web;
        
    const redirectUri = redirect_uris[0];

    const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirectUri
    );

    try{
        const {tokens} = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        
        await saveCredentials(oAuth2Client);
        console.log('✅ Authorization completed, token saved!')

        return oAuth2Client;
    }catch(err){
        console.error('❌ Error exchanging code for token:', err.message);
        process.exit(1);
    }
}

async function authorizeConsole() {
    console.log("📥 Starting full auth mode...");

    const existing = await loadCredentials();
    if(existing){
        console.log('✅ Existing token works.');
        return existing;
    }

    const authUrl = await getAuthUrl();
    console.log(`\nPlease visit: ${authUrl}`);
    console.log('Enter code form that page below:\n');

    const readL = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const code = await new Promise((resolve)=>{
        readL.question('Code: ',(answer)=>{
            
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
            }
            
            readL.close();
            resolve(answer.trim());
        });
    });

    await finishAuth(code);
}

async function tokenCheck() {
    try{
        await fsPromises.access(TOKEN_PATH)
        console.log("Yes token")
        return true
    }catch(err){
        console.log("No token")
        return false
    }
}

async function deleteToken() {
    try{
        await unlink(TOKEN_PATH);
        console.log(`Successfuly deleted ${TOKEN_PATH}`);
        return true
    }catch(err){
        console.error('There was an error:',err.message)
        return false
    }
}

async function authorizeByHand() {
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
        const content = await readMyFile(CREDENTIALS_PATH)
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

        console.log(`Go to this URL ${authUrl}`);

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
                }
        
                
            });
        });
        if(!code){
            console.log('❌ no code ');
            process.exit(1);
        }

        const {tokens} = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
    
        await saveCredentials(oAuth2Client);
    
        return oAuth2Client;
    })();
    return authorizePromise;
}


if(require.main === module){
    (async ()=>{
        if(command === 'getUrl'){
           const url = await getAuthUrl();
           console.log(url)
        }else if(command === 'finish'){
            if(!maybeCode){
                console.error('❌ No code provided for finish');
                process.exit(1);
            }
            await finishAuth(maybeCode);
        }else if(command === 'authorize'){
            await authorizeConsole();
        }else if(command === 'authorizeByHand'){
            await authorizeByHand();
        }else if(command === 'tokenCheck'){
            await tokenCheck();
        }else if(command === 'deleteToken'){
            await deleteToken();
        }else{
            console.log('ℹ️ No valid command provided.\nTry one of:');
            console.log('   node Authorize.js getUrl');
            console.log('   node Authorize.js finish <code>');
            console.log('   node Authorize.js authorize');
            console.log('   node Authorize.js tokenCheck');
        }
    })();
}





//пока проверяем через Express server
module.exports = {authorizeByHand}

/* ОПЕЧАТАН пока нужно затестить передачу данных юзеру во время активной авторизации 
        //await open(authUrl)
        //await open(authUrl, {app:{name:'chrome'}}).catch(()=>  open(authUrl));

        const code = await new Promise((resolve, reject)=>{
            const server = http.createServer(async (req,res)=>{
                if(req.url.startsWith('/?code=')){
                    const url = new URL(req.url, `http://localhost:8080`);
                    const code = url.searchParams.get('code');

                    res.writeHead(200,{'Content-Type': 'text/html'});
                    res.end('<h2>Authorization successful!</h2>');

                    server.close(); //потребуется минута перед закрытием , мне лень исправлять ) 
                    resolve(code)
                }else{
                    res.writeHead(404);
                    res.end();
                }
            });
            server.listen(8080, ()=> {
                //console.log('Listening on http://localhost:8080/ for Google OAuth...')
            });
        });

        //console.log(`Received code: ${code}`);
*/

 
/* старая модель команд
if(require.main === module){
    const arg = process.argv[2];

    if(arg === 'authorize'){
        authorize().then(()=>{
            console.log("✅Auth test start");
            process.exit(0);
        }).catch(err=>{
            console.error("❌ Error during starting Auth", err);
            process.exit(1);
        });
    }else{
        console.log("ℹ️ No valid command provided. Try: \n node Authorize.js authorize");
    }
}
*/