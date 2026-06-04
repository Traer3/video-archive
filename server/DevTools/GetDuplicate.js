const { cleanName } = require("../services/toolsService");
const { readFolders } = require("../services/videoService")


const VIDEOS_DIR = path.join(__dirname, "../videos");

exports.GetDuplicate = async () => {
    const videoFiles = await readFolders(VIDEOS_DIR);
    
};

async function getSameName(videoFiles) {
    const sameName = [];
    const filesMap = new Map(videoFiles.map(video => [cleanName(video.name),video]))
    for(const video of videoFiles){
        const videoName = cleanName(video.name);
        const found = filesMap.get(videoName);
        if(found){

        }
    }
}