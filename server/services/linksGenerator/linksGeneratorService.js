const { consoleAuthorization } = require("../../middleware/auth/authorize");
const { getVideoList } = require("../videoService");
const { cleanName } = require('../toolsService');
const { writeLinks, getLinks } = require('../linksService');
const { getYouTubeLinks } = require("./getYouTubeLinks");
const { newNameChecker, clearNames } = require("./newNameChecker");
const { simulateDownload } = require("./simulatingDownload");

exports.YTGetLinks = async () => {
    console.log("Starting geting links...");
    const DBvideos = await getVideoList();
    const Links = await getLinks();
    const auth = await consoleAuthorization();

    const currentYTVideos = auth.status
        ? await getYouTubeLinks(auth.client)
        : [];

    const freshLinks = await sendNewLinks(Links, currentYTVideos);
    if (freshLinks || freshLinks.length > 0) {
        await sendLikes(freshLinks);
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

async function sendNewLinks(Links, YTVideos) {
    if (!Links || Links.length === 0) {
        await sendLikes(YTVideos);
        return;
    }

    const cleanLinks = await clearNames(Links);
    const cleanYTLinks = await clearNames(YTVideos);
    const linkNames = new Set(cleanLinks.map(video => video.name))
    const freshLinks = cleanYTLinks.filter(video => !linkNames.has(video.name));
    return freshLinks;
}

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