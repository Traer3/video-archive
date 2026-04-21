const { getLikes } = require("./likesService.js");
const { addLog } = require("./logService");
const { getVideoList, saveUniqueData } = require("./videoService.js");

exports.checkUniqueness = async () => {
    console.log("Checking unique videos");
    try{
        const DBvideos = await getVideoList();
        const YTLikes = await getLikes(); 
        await IsItUnique(DBvideos, YTLikes);
        console.log("🏁 Finished with the checking")
    }catch(err){
        console.log("Error reading DB: ", err.message)
        return []; 
    }
};

async function IsItUnique(DBvideos,YTLikes) {
    const cleanName = (str) => {
        if(!str) return "";
        return str
            .trim()
            .toLowerCase()
            .replace(/[\uFF1A]/g, ':')
            .replace(/\s+/g, ' ')
    };

    try{
        const oldVideos = await ageChecker(DBvideos);
        const oldVideosForCheck = oldVideos.filter(vid => vid.isitunique === false);
        
        const likedNamesSet = new Set(
            YTLikes.map(v => cleanName(v.video_name))
        );
        const uniqueVideos = oldVideosForCheck.filter(
            vid => !likedNamesSet.has(cleanName(vid.name))
        );
        
        for(const vid of uniqueVideos){
            console.log(`Vid id: ${vid.id}, name: ${vid.name}, isitunique: true`);
            await saveUniqueData({vidId: vid.id, isitunique: true})
            await addLog({
                type:"IsItUniqueLogs", 
                message: `✅ Unique video id: ${vid.id}, name: ${vid.name}`
            });
        }
    }catch(err){
        console.error(`Executing IsItUnique: `, err);
    }
};

async function ageChecker(DBvideos) {
    const now = Date.now();
    const DAY_24H = 24 * 60 * 60 * 1000;
    const oldVideos = [];

    for(const vid of DBvideos){
        const videoTime = new Date(vid.created_at).getTime();
        const diff = now - videoTime;

        if(diff < DAY_24H){
            continue;
        }
        oldVideos.push(vid);
    };
    return oldVideos;
}