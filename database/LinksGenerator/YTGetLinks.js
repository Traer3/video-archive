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

const youTubeTestNames = [
    'Kickstart My Heart (2024 Remaster)',
    'Seia: I Drive【Blue Archive Animation】',
    "A Homemade Live-Action of Max0r's Metal Gear Rising Summary | Part 1",
    '【MAD】ワンパンマン THE HERO!!〜怒れる拳に火をつけろ〜[ほぼサイタマ] ＊リメイク',
    'Turning Portal 2 into a Web Server',
    'Anor - LO0K - Super Slowed',
    'eiby - SIREN [Super Slowed] (𝓓𝓮𝔁𝓽𝓮𝓻 𝓮𝓭𝓲𝓽 𝓼𝓸𝓷𝓰)',
    'Cell Transforms Into Perfect Cell | Perfect Cell Theme|Dragon Ball Z | Full HD |',
    '“Eobard Thawne, The Reverse Flash” Reverse Flash EDIT | Shadows - Pastel Ghost #theflash #edit',
    '🦈 エレン・ジョー #zzzero #ゼンゼロ #ブルーセチ',
    '세이아와 드라이브 데이트, 시티 팝 【 1시간 끊김없이 loop 】',
    '게임공선【블루아카이브】',
  ];

async function newNameChecker () {
    const NamesFromDB = videoFromDB.map(video => video.name)

    const newVids = youTubeTestNames.filter(
        name => !NamesFromDB.includes(name)
    );

    // теперь тебе нужно разобраться с тем как скачать эти новые видео  
    // просто бери ссылки и имя, проверяй имена и записывай ссылки 
    console.log("New vids: ", newVids)
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
            const title = item.snippet.title;
            const videoId = item.contentDetails.videoId;
            const url = `htttps://youtu.be/${videoId}`;

            allVideos.push({title, url});
        });
        nextPageToken = res.data.nextPageToken;
        console.log(`📥 Loaded: ${allVideos.length} so far...`);
    }while(nextPageToken);

    const textOutput = allVideos.map(v => `${v.title} | ${v.url}`).join('\n');
    fs.writeFileSync('likes.txt', textOutput);

    console.log(`✅ Saved ${allVideos.length} videos in likes.txt`)
    return allVideos;
}

authorize().then(youTubeVideoData).catch(console.error);

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




