const { exec } = require("child_process");
const {authorizeByHand} = require('./Authorize');
const {google} = require('googleapis');

const config = require('../config')

async function main() {
    try{
        const DBvideos = await getVids();

        console.log("Starting geting links...");
        const auth = await authorizeByHand();
        const currentYTVideos =  await youTubeVideoData(auth);

        await newNameChecker(currentYTVideos, DBvideos);
        console.log("🏁 Links written");
    }catch(err){
        console.error("Error in main",err);
    }
}

async function newNameChecker (YTVideos, videoFromDB) {
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

    if(checkedVideos){
        console.log("🥽 Simulating a download")
        for(const video of checkedVideos){
            try{
                const comand1 = `yt-dlp -s "${video.url}"`
                const respond = await runComand(comand1);
                if(respond){
                    await sendData({url: video.url, name: video.name});
                }
            }catch(err){
                console.log(`❌ Error processing link: ${video.url}`);
                const errorMessage = err.message;
                let category =  "General error";

                if(errorMessage.includes("Sign in to confirm your age")){
                    category = "Age restriction"
                }else if(errorMessage.includes("This video is only available to Music Premium members")){
                    category = "Music Premium";
                }else if(errorMessage.includes("blocked it in your country")){
                    category = "Country restriction";
                }
                await sendData({type: "YTGetLinks", category: category, name: video.name, url: video.url})
            }
        };
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
    console.log(`✅ Received ${allVideos.length} videos from YT`)
    return allVideos;
};

async function lockedLinks(newVids) {
    const canDownload = []
    try{
        const lockedVideos =  await getLockedVideos();
        if(lockedVideos.length === 0){
            return newVids;
        };
        const lockedNames = new Set(lockedVideos.map(video => video.video_name))

        newVids.forEach(vid =>{
            const isLocked = lockedNames.has(vid.name)
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

const getLockedVideos = async () => {
    try{
        const responce = await fetch(`${config.DB_URL}/lockedVideos`);
        const data = await responce.json();
        return data;
    }catch(err){
        console.log("DB error: ", err)
    }
};

const getVids = async () => {
    try{
        const responce = await fetch(`${config.DB_URL}/videos`);
        const data = await responce.json();
        return data;
    }catch(err){
        console.log("DB error: ", err)
    }
}

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

async function sendData({url, name, scriptName, type}) {
    let body = {
        scriptName: scriptName,
        type: type,
        videoName: name,
        videoUrl: url
    };
    let res;
    if(body.scriptName && body.type){
        res = await fetch(`${config.DB_URL}/writeLockedVideos`,{
            method: "POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify(body) //scriptName,type,videoName,videoUrl
           });
    }else{
        res = await fetch(`${config.DB_URL}/writeVideoForDownload`,{
            method: "POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify(body) //videoName,videoUrl
           });
    }
   
       if(!res.ok){
        const errorData = await res.text();
        console.error(`❌ Failed writing Locked Videos: ${errorData}`);
        return;
       }
   
       const response = await res.json();
       console.log(response);
}

main();
