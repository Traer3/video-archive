const { YTGetLinks } = require("./services/linksGeneratorService");
const { getLinks } = require("./services/linksService");
const { beginDownloadingVideos } = require("./services/videoDownloaderService");


exports.VideoDownloader = async () => {
    console.log("Downloading videos");
    const likedVideos = await getLinks();
    try {
        if (likedVideos.length === 0) {
            await YTGetLinks();
            return;
        }
        //const checkTime = await checkTiming(likedVideos);
        const checkTime = true;
        if (checkTime) {
            const links = await YTGetLinks();
            await beginDownloadingVideos(links)
            return;
        } else {
            return;
        }
    } catch (err) {
        console.log(`❌ Error in VideoDownloader ${err}`);
    }
};
//ИСПРАВИТЬ ТАЙМИНГ 
// .created_at НЕТУ 
/*
async function checkTiming(likedVideos) {
    console.log("likedVideos: ", likedVideos[0].created_at)
    const lastCheck = new Date(likedVideos[0].created_at);
    const now = new Date();

    const diffMs = now.getTime() - lastCheck.getTime();

    const diffHours = diffMs / (1000 * 60 * 60);
    console.log(`Current file lifespan:  ${diffHours.toFixed(1)}`)
    if (diffHours >= 6) {
        console.log(`🕘 More than 6 hours have passed,  it's time to check  `);
        return true;
    } else {
        console.log(`It's still early! It's only been ${diffHours.toFixed(1)} hours.`);
        return false;
    }
}
*/