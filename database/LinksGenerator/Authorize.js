const fs = require('fs');
const path = require('path');
const readline = require('readline')
const {google} = require('googleapis');
const {UserRefreshClient} = require('google-auth-library');
const { default: open } = require('open');
const http = require('http');


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
        
        const redirectUri = redirect_uris[0];
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirectUri
        );
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });

        //Flag 1
        //console.log(`🔑 Log in using google:\n ${authUrl}`);

        await open(authUrl)
        //await open(authUrl, {app:{name:'chrome'}}).catch(()=>  open(authUrl));

        //Flag 2

        const code = await new Promise((resolve, reject)=>{
            const server = http.createServer(async (req,res)=>{
                if(req.url.startsWith('/?code=')){
                    const url = new URL(req.url, `http://localhost:8080`);
                    const code = url.searchParams.get('code');

                    res.writeHead(200,{'Content-Type': 'text/html'});
                    res.end(`
                        <html>
                            <head><title>Authorization Complete</title></head>
                            <body style="font-family:sans-serif; text-align:center; padding-top:50px;">
                            <h2>✅ Authorization successful!</h2>
                            <p>You can close this window now.</p>
                            <script>
                                window.close();
                                setTimeout(() => {
                                document.body.innerHTML += '<p>(If this tab did not close automatically, please close it manually.)</p>';
                                }, 1000);
                            </script>
                            </body>
                        </html>
                        `);

                    server.close();
                    resolve(code);
                }else{
                    res.writeHead(404);
                    res.end();
                }
            });
            server.listen(8080, ()=> console.log('Listening on http://localhost:8080/ for Google OAuth...'));
        });

        console.log(`Received code: ${code}`);

        const {tokens} = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
    
        await saveCredentials(oAuth2Client);
    
        return oAuth2Client;
    })();
    return authorizePromise;
}

module.exports = {authorize}
