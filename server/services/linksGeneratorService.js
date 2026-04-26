const {google} = require('googleapis');
const { consoleAuthorization } = require("../middleware/auth/authorize");
const { writeLikes, deleteLikes } = require("./likesService");
const { getVideoList } = require("./videoService");
const { writeLockedVideos, getLockedVideos } = require('./lockedVideoService');
const { runCommand, cleanName } = require('./toolsService');
const { writeLinks, getLinks } = require('./linksService');



exports.YTGetLinks = async () => {
    console.log("Starting geting links...");
    const DBvideos = await getVideoList();
    const Links = await getLinks();
    const auth = await consoleAuthorization();
    
    const currentYTVideos = await getYouTubeVideos(auth);
    if(!Links){
        await sendLikes(currentYTVideos);
    }
    
    const videoForDownload = await newNameChecker(currentYTVideos,  DBvideos, Links);
    console.log("🏁 Links written");
    console.log(videoForDownload);
    return videoForDownload;
};

async function newNameChecker(YTVideos, DBvideos ,Links) {
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

                /*
                await lockedLinks({
                    id:id, // id получаем из Links , находя по именя 
                    locked: true,
                })
                */
                
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
    if(!newVids ||  !newVids.length === 0) return [];
    try{
        const links = await getLinks();
        if(links.length === 0){
            console.log("Table links is empty")
            return newVids;
        };

        const lockedVideos = new Set(
            links
                .filter(vid => vid.locked)
                .map(vid => vid.name ? vid.name.trim() : "")
        );

        if(lockedVideos.size === 0){
            console.log("No locked vidoes found in DB")
            return newVids;
        }

        const canDownload = newVids.filter(vid => {
            const isLocked = lockedLinks.has(cleanName(vid.name));
            
            if(isLocked){
                console.log(`Skiping! Allready locked: ${vid.name}`);
            }
            return !isLocked;
        });
        return canDownload;
    }catch(err){
        console.error(`❌ Error while sorting lockedLinks `,err.message);
        return [];
    }
};

async function getYouTubeVideos(auth) {
    console.log("getYouTubeVideos: working")
    try{
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
    }catch(err){
        console.error(`Error in getYouTubeVideos : ${err}`)
        return [];
    }
};

async function sendLikes(YouTubeVideos) {
    const skipVideoName = ['private video','deleted video'];
    const reverseYTLinks = [...YouTubeVideos].reverse();

    for(const video of reverseYTLinks){
        if(skipVideoName.includes(cleanName(video.name))){
            console.log(`⏭ Skipping private || deleted videos...`)
            continue;
        }
        await writeLinks({
            name: video.name,
            category: 'YouTube',
            locked:false,
            isitunique:false
        })
    };
    return console.log("✅ Links written");
}