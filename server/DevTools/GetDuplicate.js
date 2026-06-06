const { cleanName, deleteExtension } = require("../services/toolsService");
const { getVideoSize } = require("../services/videoImporter/getVideoSize");
const { readFolders } = require("../services/videoService")
const path = require('path');

const VIDEOS_DIR = path.join(__dirname, "../videos");

exports.GetDuplicate = async () => {
    const videoFiles = await readFolders(VIDEOS_DIR);
    const duplicates =  getSameName(videoFiles);
    //console.log("duplicates: ",duplicates)
    const allOccurrences = getAllOccurrences(videoFiles,duplicates)
    //console.log("allOccurrences: ",allOccurrences)
    const getSize = await videoSize(allOccurrences)
    //console.log("getSize : ",getSize)
    checkDuplicate(getSize);
};

function getSameName(videoFiles) {
    const checkedVideos = new Map();
    const duplicates = []
    for(const video of videoFiles){
        const cleanVideoName = cleanName(deleteExtension(video.name));
        const found = checkedVideos.get(cleanVideoName)
        if(found){
            duplicates.push({
                name: video.name,
                fullPath: video.fullPath, 
            })
        }else{
            checkedVideos.set(cleanVideoName,{name: video.name, fullPath: video.fullPath});
        }
    };
    return duplicates;
};

async function checkDuplicate(duplicates) {

    const sameName = new Map()
    for(const vid of duplicates) {
        if(sameName.has(vid.name)){
            sameName.get(vid.name).push(vid.sizeMB);
        }else{
            sameName.set(vid.name,[vid.sizeMB]);
        }
    }
    console.log("sameName : ",sameName) 
};

function getAllOccurrences(videoFiles,duplicates) {
    const allOccurrences = []
    const duplicateNames = new Map(duplicates.map(video => [cleanName(deleteExtension(video.name)),video]))

    for(video of videoFiles){
        const cleanVideoName = cleanName(deleteExtension(video.name))
        const found = duplicateNames.get(cleanVideoName);
        if(found){
            allOccurrences.push(video);
        }
    }
    return allOccurrences;
}

async function videoSize (allOccurrences){
    const videosInfo = []
    for(const video of allOccurrences){
        const videoName = deleteExtension(video.name)
        const videoInfo = await getVideoSize(videoName)
        if(videoInfo){
            videosInfo.push({...videoInfo,fullPath:video.fullPath})
        }
    };
    return videosInfo
}
