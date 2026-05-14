const path = require("path");
const { cleanName, deleteExtension } = require("../services/toolsService");
const { getVideoList, readFolders } = require("../services/videoService");
const { videoImporter } = require("../services/videoImporter/videoImporterService");

const VIDEOS_DIR = path.join(__dirname, "../videos");

exports.importAll = async () => {
    const videoFiles = await readFolders(VIDEOS_DIR);
        if (!videoFiles || videoFiles.length === 0) {
            console.log("📂 Nothing to import");
            return [];
        };
    const DBvideos = await getVideoList();
        if (!DBvideos || DBvideos.length === 0) {
            console.log(`⛔  DB table empty, importing all videos...`)
            for(const video of videoFiles){
                const cleanVideo = deleteExtension(video.name)
                await videoImporter(cleanVideo);
            }
            console.log(`✅ All [${videoFiles.length}] videos been imported `);
            return true;
        };

    const DBnames = new Set(DBvideos.map(video => cleanName(video.name)));
    const newVideos = await getNewVideos(DBnames, videoFiles);
        if(newVideos.length === 0){
            console.log(`🚧 No videos for importing...`);
            return null;
        };

    for (const video of newVideos) {
        await videoImporter(video);
    }
    console.log(`✅ All [${newVideos.length}] videos been imported `);
    return true;
};

async function getNewVideos(DBnames, videoFiles) {
    const newVideos = []
    for (const video of videoFiles) {
        if (video.name === 'isFull.txt') {
            continue;
        }
        const cleanVideo = deleteExtension(video.name)
        const cleanVideoName = cleanName(cleanVideo);
        const foundVideo = DBnames.has(cleanVideoName);

        if (!foundVideo) {
            newVideos.push(cleanVideo);
        };
    };
    return newVideos
};
