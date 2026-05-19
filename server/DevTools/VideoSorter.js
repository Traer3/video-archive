const path = require("path");

const { readFolders, databaseOverwrite, getVideoList, importVideo } = require("../services/videoService.js");
const { exists, cleanName, deleteExtension } = require("../services/toolsService.js");
const { getLinks } = require("../services/linksService.js");
const VIDEOS_DIR = path.join(__dirname, "../videos");

exports.videoSorter = async () => {
    console.log("Sorting videos id DB");
    console.log("📂 Searching video from Folders");
    if (!(await exists(VIDEOS_DIR))) {
        console.error("Missing video folder");
        return;
    };
    const oldTable = await getVideoList();
    

    const videoFiles = await readFolders(VIDEOS_DIR);
    const likedVideos = await getLinks();

    const noCategory = await noCategorySorter(videoFiles, likedVideos);
    const YTvideos = await YTVideos(videoFiles, likedVideos);
    
    const sortedList = [...YTvideos, ...noCategory];

    const newList =  await writeOldData(oldTable, sortedList);
    await DatabaseOverwrite(newList);
    console.log("✅ Videos sorted!")
};

async function noCategorySorter(videoFiles,likedList) {
    const noCategoryVideos = []
    const likedListSet = new Set(likedList.map(video => cleanName(video.name)));

    for(const video of videoFiles){
        const videoName = deleteExtension(video.name)
        const cleanVideoName = cleanName(videoName);
        if(cleanVideoName === 'isfull'){
            continue;
        }
        const foundVideo = likedListSet.has(cleanVideoName);
        if(!foundVideo){
            noCategoryVideos.push(videoName);
        }
    };
    return noCategoryVideos;
}

async function YTVideos(videoFiles, likedList) {
    const YTvideos = new Set();
    const likedListName = [...likedList.map(video => video.name)].reverse()
    const fileNames = new Set(videoFiles.map(video => {
        const videoName = deleteExtension(video.name);
        const cleanedName = cleanName(videoName)
        return cleanedName;
    }));
    
    likedListName.forEach(vid => {
        const videoName = cleanName(vid);
        const foundVideo = fileNames.has(videoName);
        if(foundVideo){ 
            YTvideos.add(vid)
        };
    })
    const reverseExistedList = [...YTvideos].reverse()
    
    return reverseExistedList;
};

async function DatabaseOverwrite(newList) {
    console.log("🔄 Rewriting old DB");
    const result = await databaseOverwrite();
    if (result.success) { result.message }

    try {
        for(const video of newList){
            await importVideo({
                name: video.name,
                duration: video.duration,
                sizeMB: video.size_mb,
                category: video.category,
                isitunique: video.isitunique,
                filtered: video.filtered
            });
        };
    } catch (err) {
        console.error("❌ Error during DatabaseOverwrite : ", err.message);
    }
};

async function writeOldData(oldTable, sortedList) {
    const videos = []
    const oldTableMap = new Map(oldTable.map(video => [cleanName(video.name), video]))
    for(const newVideo of sortedList){
        const cleanVideoName = cleanName(newVideo)
        const foundVideo = oldTableMap.get(cleanVideoName);
        
        if(foundVideo){
            const {id, ...video} = foundVideo;
            videos.push(video)
        }
    };
    return videos
}