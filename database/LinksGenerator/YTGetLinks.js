const fsPromises = require("fs").promises
const { exec } = require("child_process");
const path = require("path");
const {authorizeByHand} = require('./Authorize');
const {google} = require('googleapis');

const config = require('../config')

const VIDEOS_LINKS_PATH = path.join(__dirname, 'VideoForDownload.txt');
const LIKES_LINKS_PATH = path.join(__dirname, 'likes.txt');

const LOCKED_VIDEOS = path.join(__dirname,'lockedVideos.txt')
//const FAILED_FILE = path.join(__dirname,'../failed.txt');

const getLockedVideos = async () => {
    try{
        const responce = await fetch(`${config.DB_URL}/lockedVideos`);
        const data = await responce.json();
        console.log("LockedVideos data: ", data)
    }catch(err){
        console.log("DB error: ", err)
    }
};

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
};

async function readMyFile(filePath) {
    try{
        const content = await fsPromises.readFile(filePath,'utf-8');
        return content
    }catch(err){
        console.error(`❌Error reading file ${filePath} `,err.message)
        return null;
    }
};

function runComand(comand){
    return new Promise((resolve, reject)=>{
        exec(comand,(error, stdout, stderr)=>{
            if(error){
                reject(error);
            }else{
                resolve(stdout || stderr);
            }
        });
    });
};

async function writeLockedVideos (scriptName,type,videoName,videoUrl) {
    const res = await fetch(`${config.DB_URL}/writeLockedVideos`,{
     method: "POST",
     headers:{"Content-Type":"application/json"},
     body: JSON.stringify({scriptName,type,videoName,videoUrl})
    });

    if(!res.ok){
     const errorData = await res.text();
     console.error(`❌ Failed writing Locked Videos: ${errorData}`);
     return;
    }

    const data = await res.json();
    console.log(data);
 };

async function newNameChecker (YTVideos) {
    if(!YTVideos) return;
    const NamesFromDB = new Set(videoFromDB.map(video => video.name))

    const newVids = YTVideos.filter(video =>{
        const name = video.name;
        const isTrash = name === "Private video" || name === "Deleted video";
        if(isTrash) return false;
        const isAlreadyInDB = NamesFromDB.has(name);
        return !isAlreadyInDB
    });

    
    const checkedVideos = await lockedLinks(newVids);
    const canDownload = [];

    console.log("Simulating a download")
    if(checkedVideos){
        for(const video of checkedVideos){
            try{
                const comand1 = `yt-dlp -s "${video.url}"`
                const respond = await runComand(comand1);
                if(respond){
                    canDownload.push(video)
                }
            }catch(err){
                console.log(`❌ Error processing link: ${video.url}`);
                //console.log(`❌ Error processing link: ${video.url} " ${err.message} "`);
                const errorMessage = err.message;
                let category =  "General error";

                if(errorMessage.includes("Sign in to confirm your age")){
                    category = "Age restriction"
                }else if(errorMessage.includes("This video is only available to Music Premium members")){
                    category = "Music Premium";
                }else if(errorMessage.includes("blocked it in your country")){
                    category = "Country restriction";
                }
                //const logLine = `[${category}] ${video.name} | ${video.url}\n`
                await writeLockedVideos("YTGetLinks",`${category}`,`${video.name}`,`${video.url}`)
                //await fsPromises.appendFile(LOCKED_VIDEOS, logLine);
                
            }
        };
    }
    
    const textOutput = canDownload
        .map(v => `${v.url}`)
        .reverse()
        .join('\n');
    if(textOutput.length > 0){
        await writeInfo(VIDEOS_LINKS_PATH, textOutput);
    }
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
};




async function extractingLockedLinks() {
    const lockedVideos = await readMyFile(LOCKED_VIDEOS);
    if(!lockedVideos) {
        console.log(`lockedVideos.txt empty or Missing ${LOCKED_VIDEOS}`);
        return [];
    };
    
    try{
        const lines = lockedVideos.split(/\r?\n/);
        return lines
    }catch(err){
        console.error(`❌ Error while extracting links from ${LOCKED_VIDEOS}: " ${err.message} "`); 
    }


}

async function lockedLinks(newVids) {
    const canDownload = []
    try{
        const lockedVideos = await extractingLockedLinks(); 
        if(lockedVideos.length === 0){
            return newVids;
        }
        
        newVids.forEach(vid =>{
            const isLocked = lockedVideos.some(lockedLine => lockedLine.includes(vid.name));
            if(!isLocked){
                canDownload.push(vid);
            }else{
                console.log(`Skiping! Allready in list:  ${vid.name}`)
            }
        });
        return canDownload;
    }catch(err){
        console.error(`❌ Error while sorting lockedLinks `,err.message);
    }

};



async function main() {
    try{
        console.log("Starting geting links...");
        await getVids();
        //await getFailed()
        
        //const auth = await authorizeByHand();
        //const currentYTVideos =  await youTubeVideoData(auth);
        const test = [{
            name: "Hotline Miami 2: Wrong Number - Dial Tone Trailer",
            url: "https://youtu.be/Kqr0yUuSiTs"
        }]

        //await newNameChecker(test);

        //await extractingLockedLinks()

        await getLockedVideos();
        console.log("🏁 Links written");

    }catch(err){
        console.error("Error in main",err);
    }
}

main();

/*
//deprecated
async function extractFailedLinks() {
    const fileContent = await readMyFile(FAILED_FILE);
    if(!fileContent) {
        console.log(`Missing ${FAILED_FILE}`)
        return;
    };

    try{
        const lines = fileContent.split(/\r?\n/);

        const youtubeLinks = lines
        .filter(line => line.includes('https://youtu.be/'))
        .map(line => {
            const match = line.match(/https:\/\/youtu\.be\/[\w-]+/);
            return match ? match[0] : null;
        })
        .filter(Boolean);
        //youtubeLinks.forEach(link => console.log("Link: ",link))
        //console.log("youtubeLinks lengh : ", youtubeLinks.length)
        return youtubeLinks
        
    }catch(err){
        console.error(`❌ Error while extracting links from ${FAILED_FILE}: `,err.message);
    }   
};
*/

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