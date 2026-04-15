const fsPromises = require("fs").promises
const path = require('path');

const { readFolders, getVideoList, deleteVideo} = require("./videoService.js");
const { exists } = require("./toolsService.js");
const { addLog } = require("./logService.js");

const VIDEOS_DIR = path.join(__dirname,"../videos");
const THUMBNAILS_DIR = path.join(__dirname,"../thumbnails");

exports.videoEraser = async (videoId) => {
    const id = Number(videoId)
    
    if(!(await exists(VIDEOS_DIR)) || !(await exists(THUMBNAILS_DIR))){
        console.error("Missing videos or thumbnails folder");
        return;
    };

    if(!id){
        console.error('❌ No video provided for deletion');
        return;
    }

    const existingVideos = await getVideoList();
    //console.log("existingVideos: ", existingVideos)
    const isVideoExited = existingVideos.find(video => video.id === id);
    
    if(!isVideoExited){
        console.log(`Video id ${id} missing in DB `)
        return;
    }

    const videoFiles = await readFolders(VIDEOS_DIR);
    const thumbnailFiles = await readFolders(THUMBNAILS_DIR);
    
    

    //await VideoEraser(videoId, videoFiles, thumbnailFiles, existingVideos)
};

async function VideoEraser(videoFiles,thumbnailFiles, existingVideos, isVideoExited) {
    console.log(`id for deletion : ${isVideoExited.id}`);

    /*
        await deleteVideoInFolder(mainFolder, isVideoExited.name)
        await deleteThumbnailInFolder(thumbnailFiles, isVideoExited.name)

       
    */

    //await deleteVideo({videoId: isVideoExited.id})
    
};

async function ThumbnailEraser(thumbnailFiles, isVideoExited) {
    console.log(`id for deletion : ${isVideoExited.id}`);
    await deleteThumbnailInFolder(thumbnailFiles, isVideoExited.name)
    //await logWriter("EraserLogs",`✅ Thumbnail deleted: ${videoName}`)
};

async function deleteThumbnailInFolder(thumbnailFiles, videoName) {
    console.log(`Deleting thumbnail for ${videoName}`);
    const thumbnailName = `${videoName}.jpg`;
    const findThumbnail = thumbnailFiles.find(thumbnail => thumbnail.name === thumbnailName);
    try{
        await fsPromises.rm(findThumbnail.fullPath)
        console.log(`File deleted: ${videoName}`)
    }catch(err){
        console.error("Error while executing deleteThumbnailInFolder ", err.message)
        //await logWriter("EraserLogs",`Deletion ${videoName} failed: ${err.message}`)
    } 
}