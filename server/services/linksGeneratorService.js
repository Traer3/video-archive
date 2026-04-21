const {google} = require('googleapis');
const { consoleAuthorization } = require("../middleware/auth/authorize");
const { writeLikes, deleteLikes } = require("./likesService");
const { getVideoList } = require("./videoService");
const { writeLockedVideos, getLockedVideos } = require('./lockedVideoService');
const { runCommand } = require('./toolsService');



exports.YTGetLinks = async () => {
    console.log("Starting geting links...");
    const DBvideos = await getVideoList();
    const auth = await consoleAuthorization();
    
    const currentYTVideos = await getYouTubeVideos(auth);
    await sendLikes(currentYTVideos);
   
    const videoForDownload = await newNameChecker(currentYTVideos,  DBvideos);
    console.log("🏁 Links written");
    console.log(videoForDownload);
    return videoForDownload;
};

async function newNameChecker(YTVideos, DBvideos) {
    if(!YTVideos) return;
    const videoForDownload = [];
    const NamesFromDB = new Set(DBvideos.map(video => video.name))
    

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
        let i = 0;
        for(const video of checkedVideos){
            i++
            try{
                console.log("Trying yt-dlp ....")
                const comand1 = `yt-dlp -s "${video.url}"`
                const respond = await runCommand(comand1);
                if(respond){
                    console.log(`[${i}/${checkedVideos.length}] processing video : ${video.name}\n`)
                    videoForDownload.push({name: video.name, url: video.url})
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
                await writeLockedVideos({
                    scriptName: "writeLockedVideos",
                    type: category,
                    videoName: video.name,
                    videoUrl: video.url,
                });
            }
        };
        return videoForDownload;
    }
};

async function lockedLinks(newVids) {
    const canDownload = []
    try{
        const lockedVideos =  await getLockedVideos();
        if(lockedVideos.length === 0){
            console.log("lockedVideos is empty")
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

async function getYouTubeVideos(auth) {
    console.log("getYouTubeVideos: working")
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

        res.data.items.forEach(async item => {
            const name = item.snippet.title;
            const videoId = item.contentDetails.videoId;
            const url = `https://youtu.be/${videoId}`;
           
            allVideos.push({name, url});
        });
        nextPageToken = res.data.nextPageToken;
        console.log(`📥 Loaded: ${allVideos.length} so far...`);

       //if(allVideos.length >= 5) break; //ссылки для первых 100 видео 

    }while(nextPageToken);
    console.log(`✅ Received ${allVideos.length} videos from YT`)
    return allVideos;
};

async function sendLikes(YouTubeVideos) {
    console.log("Deleting old links...");
    await deleteLikes();

    YouTubeVideos.map(async video => {
       await writeLikes({
            videoName: video.name,
            videoUrl: video.url
        })
    });
    return console.log("✅ Links written");
}