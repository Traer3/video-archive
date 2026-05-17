
const { YTGetLinks } = require("./services/linksGenerator/linksGeneratorService");
const { getLinks, writeUpdate } = require("./services/linksService");
const { beginDownloadingVideos } = require("./services/videoDownloaderService");


exports.VideoDownloader = async () => {
    console.log("Downloading videos");
    try {
        const likedVideos = await getLinks(); 
        if (!likedVideos || likedVideos.length === 0) {
            const links = await YTGetLinks();
            console.log("links : ", links)
            if(links && links.length > 0){
                await beginDownloadingVideos(links);
            };
            return;
        }
        const latestVideo = await updateTime(likedVideos);
        const checkTime = await checkTiming(latestVideo);

        if (checkTime) {
            const links = await YTGetLinks();
            await beginDownloadingVideos(links)
        }
        return;
    } catch (err) {
        console.log(`❌ Error in VideoDownloader ${err.message}`);
        return null;
    }
};

async function updateTime(likedVideos) {
    const reverseYTLinks = [...likedVideos].reverse();
    const latestVideo = reverseYTLinks[0];
    const currentTime = new Date();

    if (!latestVideo.last_updated) {
        await writeUpdate({
            id: latestVideo.id,
            lastUpdated: currentTime
        });
        return { ...latestVideo, last_updated: currentTime };
    } else {
        return latestVideo;
    }
}

async function checkTiming(latestVideo) {
    const lastCheck = latestVideo.last_updated;
    const now = new Date();

    const diffMs = now.getTime() - lastCheck.getTime();

    const diffHours = diffMs / (1000 * 60 * 60);
    console.log(`Current file lifespan:  ${diffHours.toFixed(1)}`)
    if (diffHours >= 6) {
        console.log(`🕘 More than 6 hours have passed,  it's time to check  `);
        await writeUpdate({
            id: latestVideo.id,
            lastUpdated: now
        });
        return true;
    } else {
        console.log(`It's still early! It's only been ${diffHours.toFixed(1)} hours.`);
        return false;
    }
}
