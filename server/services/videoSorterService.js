const path = require("path");

const { readFolders, databaseOverwrite, getVideoList, importVideo } = require("./videoService.js");
const { exists, cleanName } = require("./toolsService");
const { getLinks } = require("./linksService.js");
const { addLog } = require("./logService.js");
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
    const sortedList = await SortedList(videoFiles, likedVideos);
    const newList =  await writeOldData(oldTable, sortedList);
    await DatabaseOverwrite(newList);

    console.log("✅ Videos sorted!")
};

async function SortedList(videoFiles, likedList) {
    const existedVidoes = [];
    const likedListName = [...likedList.map(video => video.name)].reverse()
    const fileNames = new Set(videoFiles.map(video => {
        const videoName = video.name.replace(/\.mp4$/i, '');
        const cleanedName = cleanName(videoName)
        return cleanedName;
    }));

    likedListName.forEach(async vid => {
        const videoName = cleanName(vid);
        const foundVideo = fileNames.has(videoName);
        if(foundVideo){
            existedVidoes.push(vid);
        }else{
            /*
            await addLog({
                type: "SorterService",
                message: `⚠ Missing video : ${vid}`
            })
            */
        }
    })
    const reverseExistedList = existedVidoes.reverse()
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
    const oldTableMap = new Map(oldTable.map(video => [video.name, video]))
    for(const newVideo of sortedList){
        const foundVideo = oldTableMap.get(newVideo);
        if(foundVideo){
            const {id, ...video} = foundVideo;
            videos.push(video)
        }
    };
    return videos
}