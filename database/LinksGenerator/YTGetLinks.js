//You need credentials.json from Google Cloud Console  ->   OAuth client ID  
const fs = require('fs');
const path = require('path');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

async function loadSavedCredentialsIfExist() {
    try{
        const content = fs.readFileSync(TOKEN_PATH);
        return google.auth.fromJSON(JSON.parse(content));
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

async function authorize(){


    let client = await loadSavedCredentialsIfExist();
    if (client) return client; 

    const content = fs.readFileSync(CREDENTIALS_PATH);
    const credentials = JSON.parse(content);
    const {client_secret, client_id, redirect_uris} = credentials.installed;


    const oAuth2Client = new google.auth.OAuth2(
        client_id , client_secret, redirect_uris[0]);
    
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('Authorize this app by visiting this url:', authUrl);

    const readline =  require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const code = await new Promise(resolve => {
        readline.question('Enter the code from that page here: ', resolve);
    });

    
    readline.close();

    const {tokens} = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    await saveCredentials(oAuth2Client);

    return oAuth2Client;
}

async function listLikedVideos(auth) {
    const service = google.youtube('v3');
    let nextPageToken = null;
    const allVideos = [];

    do{
        const res = await service.playlistItems.list({
            playlistId: 'LL',
            part: 'contentDetails',
            maxResults: 50,
            pageToken: nextPageToken || undefined,
            auth,
        });

        res.data.items.forEach(item => {
            allVideos.push(`https://youtu.be/${item.contentDetails.videoId}`);
        });

        nextPageToken = res.data.nextPageToken;
        console.log(`📥 Loaded: ${allVideos.length} so far...`)
    } while(nextPageToken);

    fs.writeFileSync('likes.txt',allVideos.join('\n'));
    console.log(`✅ Saved: ${allVideos.length} vids in likes.txt`)
}

authorize().then(listLikedVideos).catch(console.error);