const path = require('path');
const Ffmpeg = require("fluent-ffmpeg");

const { readFolders, getVideoList, saveVidDuration } = require("./videoService.js");
const { exists, addExtension } = require("./toolsService");
const { addLog } = require("./logService.js");
const { clearNames } = require('./linksGenerator/newNameChecker.js');
const VIDEOS_DIR = path.join(__dirname, "../videos");


exports.durationGenerator = async () => {
    console.log("Saving video duration");
    if (!(await exists(VIDEOS_DIR))) {
        console.error("Missing video folder");
        return;
    };
    try {
        const DBvideos = await getVideoList();
        const cleanDBNames = await clearNames(DBvideos)
        const folderVideos = await readFolders(VIDEOS_DIR);
        const cleanFolder = await clearNames(folderVideos);

        const folderMap = cleanFolder.length > 0
            ? new Map(cleanFolder.map(video=>  [video.name, video]))
            : new Map();

        if (!DBvideos || !cleanFolder) {
            console.log("DBvideos or folderVideos empty");
            return;
        }

        for (const vid of cleanDBNames) { // сделать для всех и для одного 
            if (vid.duration) {
                console.log(`--> Already has duration: ${vid.name}`);
                continue;
            };
            let vidName = addExtension(vid.name,'.mp4');
            const  folderVideo = folderMap.get(vidName)

            if (folderVideo) {
                try {
                    const duration = await getVideoDuration(folderVideo.fullPath)
                    console.log("Duration ", duration);
                    console.log("Id: ", vid.id)
                    await saveVidDuration({ vidId: vid.id, vidDurationData: duration })
                    await addLog({
                        type: "DurationFethcer",
                        message: `✅ Successfully generated for video ${vid.id} , duration ${duration}`
                    });
                } catch (err) {
                    console.error(`Error getting duration for ${vidName} : ${err.message}`)
                    await addLog({
                        type: "DurationFethcer",
                        message: `❌ Error generating duration for video ${vid.id}`
                    });
                }
            } else {
                console.log(`Video not found ${vidName}`)
            };
        }
    } catch (err) {
        console.error(`❌ Error generating duration : ', ${err.message}`);
    }
};

async function getVideoDuration(filePath) {
    return new Promise((resolve, reject) => {
        console.log("filePath ", filePath)
        const absolutePath = path.resolve(filePath)
        Ffmpeg.ffprobe(absolutePath, (err, metadata) => {
            if (err) {
                console.error("FFprobe for path:", absolutePath)
                return reject(err);
            }
            const duration = metadata.format.duration;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`
            resolve(formatted);
        })
    })
};

