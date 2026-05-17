const fsPromises = require("fs").promises
const Ffmpeg = require("fluent-ffmpeg");
const path = require('path');

const { readFolders } = require("./videoService.js");
const { exists, addExtension, deleteExtension, cleanName } = require("./toolsService.js");
const { addLog } = require("./logService.js");

const VIDEOS_DIR = path.join(__dirname, "../videos");
const THUMBNAILS_DIR = path.join(__dirname, "../thumbnails");

exports.generateThumbnail = async (name) => {
    console.log("🔍 Checking main folders")
        if (!(await exists(VIDEOS_DIR)) || !(await exists(THUMBNAILS_DIR))) {
            console.error("Missing folder");
            return null;
        };
    const fileName = deleteExtension(name);
    const thumbnailFiles = await readFolders(THUMBNAILS_DIR);
    const thumbnailNames = new Set(thumbnailFiles.map(thumbnail => cleanName(thumbnail)));
    const videoFiles = await readFolders(VIDEOS_DIR);
    const videoFilesMap = new Map(videoFiles.map(video => [cleanName(video.name), video]))

    try {
        const state = checkExistence(fileName, thumbnailNames);
            if (state === true) {
                console.log("Thumbnailalready exist");
                return true;
            }
        const videoPath = await getPath(name, videoFilesMap);
        const thumbnailFolder = await findFolder();

        if (videoPath) {
            console.log(`🎬 Generating thumbnail for: ${name}`);
            const answer = await generateThumbnail(videoPath, thumbnailFolder, fileName);
            console.log(`✅ Thumbnail generated : ${fileName}`);
            await addLog({
                type: "ThumbnailGeneratorLogs",
                message: `✅ Thumbnail generated : ${fileName}`
            })
            return answer;
        };
    } catch (err) {
        console.error(`Error in generateThumbnail: ${err}`);
        return null
    }
};

exports.generateThumbnails = async () => {
    console.log("🔍 Checking main folders")
        if (!(await exists(VIDEOS_DIR)) || !(await exists(THUMBNAILS_DIR))) {
            console.error("Missing folder");
            return null;
        };
    const thumbnailFiles = await readFolders(THUMBNAILS_DIR);
    const thumbnailNames = new Set(thumbnailFiles.map(thumbnail => cleanName(thumbnail)));
    const videoFiles = await readFolders(VIDEOS_DIR);
    const videoFilesMap = new Map(videoFiles.map(video => [cleanName(video.name), video]))

    for (const video of videoFiles) {
        try {
            const fileName = deleteExtension(video.name);
            const state = checkExistence(fileName, thumbnailNames);
                if (state === true) continue;
            const videoPath = await getPath(video.name, videoFilesMap);
            const thumbnailFolder = await findFolder();
                if (videoPath) {
                    console.log(`🎬 Generating thumbnail for: ${fileName}`);
                    const answer = await generateThumbnail(videoPath, thumbnailFolder, fileName);
                    console.log(`✅ Thumbnail generated : ${fileName}`);
                    await addLog({
                        type: "ThumbnailGeneratorLogs",
                        message: `✅ Thumbnail generated : ${fileName}`
                    })
                    return answer;
                };
        } catch (err) {
            console.error(`Error in generateThumbnails : ${err}`);
            return null;
        }
    }
    console.log('🏁 All thumbnail generated!')
}

async function checkExistence(name, thumbnailNames) {
    const thumbnailName = cleanName(name);
    const foundThumbnail = thumbnailNames.has(thumbnailName);
    if (foundThumbnail) {
        return true;
    };
    return false;
};
async function getPath(name, videoFilesMap) {
    const videoName = cleanName(name);
    const foundVideo = videoFilesMap.get(videoName);
    if (foundVideo) {
        return foundVideo.fullPath
    }
    return false;
};

async function findFolder() {
    const mainFolder = await readDirAsync(THUMBNAILS_DIR);
    let subFolderPath;
    for (const subFolder of mainFolder) {
        subFolderPath = path.join(THUMBNAILS_DIR, subFolder);
    }
    return subFolderPath
}

async function generateThumbnail(videoPath, thumbnailFolder, fileName) {
    const thumbnailName = addExtension(fileName, '.jpg');
    return new Promise((resolve, reject) => {
        Ffmpeg(videoPath)
            .on('end', () => resolve(thumbnailFolder))
            .on('error', (err) => reject(err))
            .screenshot({
                count: 1,
                timemarks: ['00:00:02.000'],
                filename: thumbnailName,
                folder: thumbnailFolder,
                size: '320x240',
            });
    });
}


async function readDirAsync(folderPath) {
    try {
        return await fsPromises.readdir(folderPath);
    } catch (err) {
        console.error(`❌Error reading folder ${folderPath} `, err.message)
        return [];
    }
}
