const fsPromises = require("fs").promises
const path = require('path');

const { readFolders, getVideoList, deleteID } = require("./videoService.js");
const { exists } = require("./toolsService.js");
const { addLog } = require("./logService.js");

const VIDEOS_DIR = path.join(__dirname, "../videos");
const THUMBNAILS_DIR = path.join(__dirname, "../thumbnails");

exports.deleteVideo = async (id) => {
    if (!(await exists(VIDEOS_DIR)) || !(await exists(THUMBNAILS_DIR))) {
        console.error("Missing videos or thumbnails folder");
        return;
    };

    const DBVideos = await getVideoList();
    const isVideoExited = DBVideos.find(video => video.id === id);
    if (!isVideoExited) {
        console.log(`Video id ${id} missing in DB `)
        return;
    }

    const videoFiles = await readFolders(VIDEOS_DIR);
    const thumbnailFiles = await readFolders(THUMBNAILS_DIR);

    await VideoEraser(videoFiles, thumbnailFiles, isVideoExited)
};

async function VideoEraser(videoFiles, thumbnailFiles, isVideoExited) {
    console.log(`id for deletion : ${isVideoExited.id}`);
    await deleteVideoFile(videoFiles, isVideoExited.name)
    await deleteThumbnailFile(thumbnailFiles, isVideoExited.name)
    await deleteID({ videoId: isVideoExited.id })
};

exports.deleteThumbnail = async (thumbnailFiles, isVideoExited) => {
    console.log(`id for deletion : ${isVideoExited.id}`);
    await deleteThumbnailFile(thumbnailFiles, isVideoExited.name);
    await addLog({
        type: "EraserLogs",
        message: `✅ Thumbnail deleted: ${isVideoExited.name}`
    });
};

async function deleteThumbnailFile(thumbnailFiles, videoName) {
    console.log(`Deleting thumbnail for ${videoName}`);
    const thumbnailName = `${videoName}.jpg`;
    const findThumbnail = thumbnailFiles.find(thumbnail => thumbnail.name === thumbnailName);
    try {
        await fsPromises.rm(findThumbnail.fullPath)
        console.log(`✅ File deleted: ${thumbnailName}`)
    } catch (err) {
        console.error("Error while executing deleteThumbnailFile ", err.message)
        await addLog({
            type: "EraserLogs",
            message: `❌ Deletion ${videoName} failed: ${err.message}`
        });
    }
};

async function deleteVideoFile(videoFiles, isVideoExited) {
    console.log(`Searching for ${isVideoExited.name}`);
    const videoName = `${isVideoExited.name}.mp4`;
    const findVideo = videoFiles.find(video => video.name === videoName);
    try {
        console.log("findVideo: ", findVideo);
        await fsPromises.rm(findVideo.fullPath)
        console.log(`✅ File deleted: ${videoName}`);
        return;
    } catch (err) {
        console.error("Error while executing deleteVideoFile ", err.message);
        await addLog({
            type: "EraserLogs",
            message: `❌ Error while executing deleteVideoFile ${err.message}`
        });
    };

}