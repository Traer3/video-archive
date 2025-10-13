//You need credentials.json from Google Cloud Console  ->   OAuth client ID  
const fs = require('fs');
const path = require('path');
const {google} = require('googleapis');
const {UserRefreshClient} = require('google-auth-library')

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');


const getVids = async () => {
    try{
        const responce = await fetch("http://192.168.0.8:3001/videos");
        const data = await responce.json();

        videoReader(data)
        newNameChecker() 
    }catch(err){
        console.log("DB error: ", err)
    }
}
getVids();

let videoFromDB = [];

const videoReader = (DBvideos) => {
    const parsedVideos = DBvideos.map((vid)=>({
     ...vid,
     name: vid.name,
     duration: vid.duration,
     size: vid.size_mb,
     category: vid.category
    }))
    
    videoFromDB = parsedVideos;
     
 }


/* тестовый вывод данных из базы данных
(async () => {
    await getVids();
    videoFromDB.map((vid)=>{
     console.log("Video name : ",vid.name , "Video size: ", vid.size, "Video Category: ", vid.category)
    })
})();
*/


const YTvidDataTest = [
    {
      name: "Taking What’s Not Yours (Animation)",
      url: "https://youtu.be/tg2-0JnFqhU"
    },
    {
      name: "Kickstart My Heart (2024 Remaster)",
      url: "https://youtu.be/e17mr5ZtWPI"
    },
    {
      name: "Seia: I Drive【Blue Archive Animation】",
      url: "https://youtu.be/96cN_fzTMC8"
    },
    {
        name: "i9zlMVYl-qkFHRth",
        url: "https://youtu.be/ghi789QWE"
    },
  ]

async function newNameChecker () {
    const YTVideos = await authorize().then(youTubeVideoData).catch(console.error);
    const NamesFromDB = videoFromDB.map(video => video.name)

    const newVids = YTVideos.filter(
        video => !NamesFromDB.includes(video.name)
    );

    const textOutput = newVids
        .map(v => `${v.url}`)
        .reverse()
        .join('\n');
    fs.writeFileSync('VideoForDownload.txt', textOutput);

}


async function loadSavedCredentialsIfExist() {
    try{
        const content = fs.readFileSync(TOKEN_PATH, 'utf-8');
        const credentials = JSON.parse(content);
        
        const client = new UserRefreshClient({
            clientId: credentials.client_id,
            clientSecret: credentials.client_secret,
            refreshToken: credentials.refresh_token,
        });
        return client;
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

async function youTubeVideoData(auth){
    const service = google.youtube('v3');
    let nextPageToken = null;
    const allVideos = [];

    do{
        const res = await service.playlistItems.list({
            playlistId: 'LL',
            part: ['snippet', 'contentDetails'],
            maxResults: 50,
            pageToken: nextPageToken || undefined,
            auth,
        });

        res.data.items.forEach(item => {
            const name = item.snippet.title;
            const videoId = item.contentDetails.videoId;
            const url = `https://youtu.be/${videoId}`;

            allVideos.push({name, url});
        });
        nextPageToken = res.data.nextPageToken;
        console.log(`📥 Loaded: ${allVideos.length} so far...`);

       if(allVideos.length >= 10) break; //ссылки для первых 100 видео 

    }while(nextPageToken);

    const textOutput = allVideos.map(v => `${v.name}`).join('\n'); //allVideos.map(v => `${v.name} | ${v.url}`).join('\n')
    fs.writeFileSync('likes.txt', textOutput);

    console.log(`✅ Saved ${allVideos.length} videos in likes.txt`)
    return allVideos;
}

//authorize().then(youTubeVideoData).catch(console.error);

async function listLikedVideoTitles(auth) {
    let allNamesYT = [];

    const service = google.youtube('v3');
    const res = await service.playlistItems.list({
        playlistId: 'LL',
        part: 'snippet',
        maxResults: 10,
        auth,
    });

    res.data.items.forEach((item)=>{
        allNamesYT.push(item.snippet.title)
        //console.log(`${index + 1}. ${item.snippet.title}`);
    });

    return allNamesYT;
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

// записывает ссылки всех видео из YT 
//authorize().then(listLikedVideos).catch(console.error);

/* для получения 10 имен из YT
(async ()=>{
    const auth = await authorize();
    const YTvidsName = await listLikedVideoTitles(auth);
    console.log(YTvidsName)
})();
*/




