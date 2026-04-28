const { consoleAuthorization } = require("../middleware/auth/authorize");
const { getVideoList } = require("./videoService");
const { cleanName } = require('./toolsService');
const { writeLinks, getLinks } = require('./linksService');
const { getYouTubeLinks } = require("./linksGenerator/getYouTubeLinks");
const { newNameChecker } = require("./linksGenerator/newNameChecker");
const { simulateDownload } = require("./linksGenerator/simulatingDownload");



exports.YTGetLinks = async () => {
    console.log("Starting geting links...");
    const DBvideos = await getVideoList();
    const Links = await getLinks();
    const auth = await consoleAuthorization();

    const currentYTVideos = auth.status
        ? await getYouTubeLinks(auth.client)
        : [];

    // это значит что тут не будет НОВЫХ лайков , только старые останутся 
    // Нужно создать условие для добавления новых видосов в список 
    if (Links.length === 0) {
        await sendLikes(currentYTVideos);
        return;
    }


    const newVideos = await newNameChecker(currentYTVideos, DBvideos, Links);
    if (!newVideos) {
        return [];
    }

    let videoForDownload
    if (newVideos.length !== 0) {
        videoForDownload = await simulateDownload(newVideos, Links)
        console.log("🏁 Links written");
        console.log(videoForDownload);
        return videoForDownload;
    }
};

async function sendLikes(YouTubeVideos) {
    const skipVideoName = ['private video', 'deleted video'];
    const reverseYTLinks = [...YouTubeVideos].reverse();

    for (const video of reverseYTLinks) {
        if (skipVideoName.includes(cleanName(video.name))) {
            console.log(`⏭ Skipping private || deleted videos...`)
            continue;
        }
        await writeLinks({
            name: video.name,
            category: 'YouTube',
            locked: false,
            isitunique: false
        })
    };
    return console.log("✅ Links written");
}