const fsPromises = require("fs").promises
const Ffmpeg = require("fluent-ffmpeg");
const path = require('path');

const { readFolders } = require("./videoService.js");
const { exists, addExtension, deleteExtension, cleanName } = require("./toolsService.js");
const { addLog } = require("./logService.js");
const { clearNames } = require("./linksGenerator/newNameChecker.js");

const VIDEOS_DIR = path.join(__dirname, "../videos");
const THUMBNAILS_DIR = path.join(__dirname, "../thumbnails");

exports.thumbnailGenerator = async () => {
    try {
        console.log("🔍 Checking main folders")
        if (!(await exists(VIDEOS_DIR)) || !(await exists(THUMBNAILS_DIR))) {
            console.error("Missing video folder");
            return;
        };

        const mainFolder = await readDirAsync(VIDEOS_DIR);

        for (const subFolder of mainFolder) {
            const subFolderPath = path.join(VIDEOS_DIR, subFolder);
            const stats = await fsPromises.stat(subFolderPath);
            if (stats.isDirectory()) {
                console.log(`\n 📂 Entering directory: ${subFolder}`);
                await processAllVideos(subFolderPath) //сделать для одного 
            }
        };
        console.log("\n🏁 All Folders processed!");
    } catch (err) {
        console.error("🔥 Error in main loog: ", err.message)
    }
};

exports.generateThumbnail2 = async (name) => {
    const fileName = cleanName(deleteExtension(name));
    const thumbnailFiles = await readFolders(THUMBNAILS_DIR);
    const thumbnailNames = new Set(thumbnailFiles.map(thumbnail => cleanName(thumbnail)));
    const videoFiles = await readFolders(VIDEOS_DIR);
    const videoFilesMap = new Map(videoFiles.map(video => [cleanName(video.name), video]))

    const state = checkExistence(name, thumbnailNames);
        if (state) {
            console.log("Thumbnailalready exist");
            return true;
        }
    const filePath = getPath(name, videoFilesMap);
    const thumbnailFolder = findFolder()
    if(filePath){
        console.log(`🎬 Generating thumbnail for: ${file}`);
        await generateThumbnail(filePath, outputPath);
        console.log(`✅ Thumbnail generated : ${name}`);
        await addLog({
            type: "ThumbnailGeneratorLogs",
            message: `✅ Thumbnail generated : ${name}`
        })
    }
};

async function checkExistence(name, thumbnailNames) {
    const fileName = deleteExtension(name);
    const thumbnailName = cleanName(fileName);
    const foundThumbnail = thumbnailNames.has(thumbnailName);
    if (foundThumbnail) {
        return true;
    };
    return false;
};
async function getPath(name, videoFilesMap) {
    const fileName = deleteExtension(name);
    const videoName = cleanName(fileName);
    const foundVideo = videoFilesMap.get(videoName);
    if (foundVideo) {
        return foundVideo.fullPath
    }
    return false;
}

async function generateThumbnail(videoPath, outputPath) {
    return new Promise((resolve, reject) => {
        Ffmpeg(videoPath)
            .on('end', () => resolve(outputPath.fullPath))
            .on('error', (err) => reject(err))
            .screenshot({
                count: 1,
                timemarks: ['00:00:02.000'],
                filename: outputPath.fullPath, //File name if file does not exist
                folder: outputPath.subFolderPath, // куда сохранить 
                size: '320x240',
            });
    });
}

async function processAllVideos(folderPath) {
    const files = await readDirAsync(folderPath);
    const existingThumbnails = await readFolders(THUMBNAILS_DIR)
    const thumbnailNames = new Set(existingThumbnails.map(thumbnail => thumbnail.name))

    for (const file of files) {
        const videoPath = path.join(folderPath, file);

        let stats;
        try {
            stats = await fsPromises.stat(videoPath);
        } catch (err) {
            console.error(`Error with ${file}`);
            continue;
        }

        if (!stats.isFile() || !file.endsWith('.mp4')) {
            continue;
        }

        const nameOnly = path.parse(file).name;
        const thumbnailName = addExtension(nameOnly, '.jpg')

        if (thumbnailNames.has(thumbnailName)) {
            //console.log(`Skipping duplicates: ${thumbnailName}`);
            continue;
        }

        const outputPath = await findPath(thumbnailName);

        try {
            console.log(`🎬 Generating thumbnail for: ${file}`);
            await generateThumbnail(videoPath, outputPath);
            console.log(`✅ Thumbnail generated : ${thumbnailName}`);
            await addLog({
                type: "ThumbnailGeneratorLogs",
                message: `✅ Thumbnail generated : ${thumbnailName}`
            })
        } catch (err) {
            console.error(`❌ error ${file}:`, err.message);
            await addLog({
                type: "ThumbnailGeneratorLogs",
                message: `❌ error ${file}: ${err.message}`
            })
        }
    }
};

async function findPath(name) {
    try {
        const mainFolder = await readDirAsync(THUMBNAILS_DIR);

        for (const subFolder of mainFolder) {
            const subFolderPath = path.join(THUMBNAILS_DIR, subFolder);
            const files = await readDirAsync(subFolderPath);

            const findThumbnail = files.includes(name);
            let thumbnailPath = null;
            if (findThumbnail) {
                thumbnailPath = path.join(subFolderPath, name);
            } else {
                thumbnailPath = name;
            }

            const instruction = {
                subFolderPath: subFolderPath,
                fullPath: thumbnailPath
            };

            return instruction
        };
    } catch (err) {
        console.error("Error in findPath : ", err.message);
        return null;
    }

}

async function readDirAsync(folderPath) {
    try {
        return await fsPromises.readdir(folderPath);
    } catch (err) {
        console.error(`❌Error reading folder ${folderPath} `, err.message)
        return [];
    }
}
