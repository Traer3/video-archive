const fsPromises = require("fs").promises
const path = require("path");

const { readFolders, databaseOverwrite, importVideo } = require("./videoService.js");
const { exists } = require("./toolsService");
const { getLikes } = require("./likesService.js");
const VIDEOS_DIR = path.join(__dirname,"../videos");

exports.videoSorter = async () => {
    console.log("Sorting videos id DB");
    console.log("📂 Searching video from Folders");
    if(!(await exists(VIDEOS_DIR))){
        console.error("Missing video folder");
        return;
    };

    const videoFiles = await readFolders(VIDEOS_DIR);
    const likedVideos = await getLikes();

    const sortedList = await SortedList(videoFiles,likedVideos);
    await DatabaseOverwrite(sortedList);
    console.log("✅ Videos sorted!")
};

async function SortedList(videoFiles, likedList) {
    const existedVidoes = [];
    const likedListName = likedList.map(video => video.video_name)
    const resersLikedList = likedListName.reverse();

    resersLikedList.map(vid => {
        let finedVideo = videoFiles.find(videoFile => {
            let formatedName = vid + ".mp4"
            return videoFile.name === formatedName
        })
        if(finedVideo){
            existedVidoes.push(finedVideo)
        }
    });

    return existedVidoes;
};

async function DatabaseOverwrite(newList) {
    console.log("🔄 Rewriting old DB");
    const result = await databaseOverwrite();
    if(result.success){result.message}
    try{
        for(const video of newList){
            const filePath = video.fullPath;
            const stat = await fsPromises.stat(filePath);
            if(stat.isFile()){
                const originalName = path.parse(video.name).name;
                const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
            
                await importVideo({
                    name: originalName,
                    duration: "",
                    sizeMB: sizeMB,
                    category: 'YouTube',
                });
            };
        }
    }catch(err){
        console.error("❌ Error during DatabaseOverwrite : ",err.message);
    }
}