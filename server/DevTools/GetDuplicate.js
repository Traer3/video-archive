const { cleanName, deleteExtension } = require("../services/toolsService");
const { readFolders } = require("../services/videoService")
const path = require('path');

const VIDEOS_DIR = path.join(__dirname, "../videos");

exports.GetDuplicate = async () => {
    const videoFiles = await readFolders(VIDEOS_DIR);
    const duplicates =  getSameName(videoFiles);
    console.log("duplicates: ",duplicates)
    const allOccurrences = getAllOccurrences(videoFiles,duplicates)
    console.log("allOccurrences: ",allOccurrences)
    //checkDuplicate();
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
    const dup = [{
        name: 'Test1',
        size: 25
    },{
        name: 'Test1',
        size: 30
    }]

    const sameName = new Map()
    for(const vid of dup) {
        if(sameName.has(vid.name)){
            sameName.get(vid.name).push(vid.size);
        }else{
            sameName.set(vid.name,[vid.size]);
        }
    }
    console.log("sameName : ",sameName) 
};

async function getAllOccurrences(videoFiles,duplicates) {
    const allOccurrences = []
    const videoNames = new Map(duplicates.map(video => [cleanName(deleteExtension(video.name)),video]))
    for(video of videoFiles){
        const cleanVideoName = cleanName(deleteExtension(video.name))
        const found = videoNames.get(cleanVideoName);
        if(found){
            allOccurrences.push(found);
        }
    }
    return allOccurrences;
}
