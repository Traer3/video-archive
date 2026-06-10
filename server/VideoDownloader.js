const { YTGetLinks } = require("./services/linksGenerator/linksGeneratorService");
const { getLinks, writeUpdate } = require("./services/linksService");
const { checkHours } = require("./services/toolsService");
const { beginDownloadingVideos } = require("./services/videoDownloaderService");

exports.VideoDownloader = async () => {
    try {
        const likedVideos = await getLinks(); 
        
        if (!likedVideos || likedVideos.length === 0) {
            const links = await YTGetLinks();
            if(links && links.length > 0){
                await beginDownloadingVideos(links);
            };
            return;
        }
        
        const latestVideo = await updateTime(likedVideos);
        const latestVideoTime = latestVideo.last_updated;
        const checkTime = checkHours(6, latestVideoTime)

        if (true) {
            const currentTime = new Date();
            await writeUpdate({
                id: latestVideo.id,
                lastUpdated: currentTime
            });
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

