const { cleanName, deleteExtension, runCommand } = require("../services/toolsService");
const { getVideoSize } = require("../services/videoImporter/getVideoSize");
const { readFolders } = require("../services/videoService")
const path = require('path');
const fsPromises = require("fs").promises

const VIDEOS_DIR = path.join(__dirname, "../videos");

//Хуйня не работает , потом доделай 
exports.GetDuplicate = async () => {
    const videoFiles = await readFolders(VIDEOS_DIR);
    const duplicates =  getSameName(videoFiles);
        //console.log("getSameName-> duplicates: ",duplicates)
    const allOccurrences = getAllOccurrences(videoFiles,duplicates)
        //console.log("allOccurrences: ",allOccurrences)
    const getSize = await videoSize(allOccurrences)
        //console.log("getSize : ",getSize)
    const videoToMove = checkDuplicate(getSize);
    //await moveVideos(videoToMove);

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
};

function checkDuplicate(duplicates) {
    const sameName = new Map();
    const dups = []
    for(const vid of duplicates) {
        const foundVideo = sameName.get(vid.name)
        if(!foundVideo || foundVideo === undefined){
            sameName.set(vid.name,[vid.sizeMB]);
            continue;
        }
        console.log("foundVideo[0] : ",foundVideo[0]);
        console.log("vid.sizeMB : ",vid.sizeMB);
        if(foundVideo[0] === vid.sizeMB){
            dups.push({name: vid.name,fullPath: vid.fullPath})
            console.log("duplicate  : ",vid.fullPath)
        }
    }
    return dups;
};


//Не только перенес ,  но и удалил копии 
async function moveVideos(videosPath) {
    if(!videosPath || videosPath.length < 0) return;
    const serverLocation = await runCommand(`pwd`)
    console.log("moveVideos -> videosPath: ",videosPath)
    for(const video of videosPath){
        const videoPath = video.fullPath.trim()
        if(serverLocation.answer){
            const duplicatesFolder = `${serverLocation.stdout.trim()}/duplicates/${video.name}`
            console.log("duplicatesFolder : ",duplicatesFolder)
        try{
            //await fsPromises.rename(videoPath, duplicatesFolder);
        }catch(err){
            console.error('Error in moveVideos : ',err)
        }
        }
        
    };
}







