const { cleanName, deleteExtension } = require("../services/toolsService");
const { readFolders } = require("../services/videoService")
const path = require('path');

const VIDEOS_DIR = path.join(__dirname, "../videos");

exports.GetDuplicate = async () => {
    const videoFiles = await readFolders(VIDEOS_DIR);
    const answer =  await getSameName(videoFiles);
    console.log("answer: ",answer)
};

//const filesMap = new Map(videoFiles.map(video => [cleanName(video.name),video]))
async function getSameName(videoFiles) {
    const checkedVideos = new Map();
    const duplicate = []
    for(const video of videoFiles){
        const cleanVideoName = deleteExtension(video.name);
        if(checkedVideos.has(cleanVideoName)){
            duplicate.push({
                name: video.name,
                fullPath: video.fullPath, 
            })
        }else{
            checkedVideos.set(cleanVideoName,{name: video.name, fullPath: video.fullPath});
        }
    };
    return duplicate;
}