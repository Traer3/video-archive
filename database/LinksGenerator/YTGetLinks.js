const fsPromises = require("fs").promises
const path = require("path");
const {authorizeByHand} = require('./Authorize');
const {google} = require('googleapis');

const config = require('../config')

const VIDEOS_LINKS_PATH = path.join(__dirname, 'VideoForDownload.txt');
const LIKES_LINKS_PATH = path.join(__dirname, 'likes.txt');


const getVids = async () => {
    try{
        const responce = await fetch(`${config.DB_URL}/videos`);
        const data = await responce.json();
        videoReader(data)
    }catch(err){
        console.log("DB error: ", err)
    }
}

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

 async function writeInfo(filePath, data) {
    try{
        await fsPromises.writeFile(filePath,data,'utf-8');
        console.log(`File successfully written: ${filePath}`)
    }catch(err){
        console.error(`Error writing: ${err.message}`)
    }
}


async function newNameChecker (YTVideos) {
    if(!YTVideos) return;
    const NamesFromDB = videoFromDB.map(video => video.name)

    const newVids = YTVideos.filter(
        video => !NamesFromDB.includes(video.name)
    );

    const textOutput = newVids
        .map(v => `${v.url}`)
        .reverse()
        .join('\n');
    await writeInfo(VIDEOS_LINKS_PATH, textOutput)

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

       //if(allVideos.length >= 100) break; //ссылки для первых 100 видео 

    }while(nextPageToken);

    const textOutput = allVideos.map(v => `${v.name} | ${v.url}`).join('\n'); //allVideos.map(v => `${v.name} | ${v.url}`).join('\n')
    await writeInfo(LIKES_LINKS_PATH, textOutput)

    console.log(`✅ Saved ${allVideos.length} videos in likes.txt`)
    return allVideos;
}

async function main() {
    try{
        console.log("Starting geting links...");
        await getVids();

        const auth = await authorizeByHand();
        const currentYTVideos =  await youTubeVideoData(auth);

        await newNameChecker(currentYTVideos);
        console.log("🏁 Links written");
    }catch(err){
        console.error("Error in main",err);
    }
}

main();



/*
old1
//You need credentials.json from Google Cloud Console  ->   OAuth client ID  
const fs = require('fs');
const {authorizeByHand} = require('./Authorize');
const {google} = require('googleapis');

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



async function newNameChecker () {
    const YTVideos = await authorizeByHand().then(youTubeVideoData).catch(console.error);
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

       if(allVideos.length >= 50) break; //ссылки для первых 100 видео 

    }while(nextPageToken);

    const textOutput = allVideos.map(v => `${v.name} | ${v.url}`).join('\n'); //allVideos.map(v => `${v.name} | ${v.url}`).join('\n')
    fs.writeFileSync('likes.txt', textOutput);

    console.log(`✅ Saved ${allVideos.length} videos in likes.txt`)
    return allVideos;
}

authorizeByHand().then(youTubeVideoData).catch(console.error);

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
//authorizeByHand().then(listLikedVideos).catch(console.error);

/* для получения 10 имен из YT
(async ()=>{
    const auth = await authorizeByHand();
    const YTvidsName = await listLikedVideoTitles(auth);
    console.log(YTvidsName)
})();






*/