const { cleanName } = require("../toolsService");


exports.newNameChecker = async (YTVideos, DBvideos, Links) => {
    if (!YTVideos) return;
    const cleanDBnames = clearNames(DBvideos);
    const cleanLinks = clearNames(Links);
    const cleanYTLinks = clearNames(YTVideos)

    const NamesFromDB = new Set(cleanDBnames.map(video => video.name))
    const clearedLinks = new Set(cleanLinks.map(video => video.name))


    const newVids = cleanYTLinks.filter(video => {
        const name = video.name;
        const isTrash = name === "Private video" || name === "Deleted video";
        if (isTrash) return false;
        const isAlreadyInDB = NamesFromDB.has(name);
        return !isAlreadyInDB
    });

    const checkedVideos = await lockedLinks(newVids, clearedLinks);

    return checkedVideos;
};

exports.clearNames = (videos) => {
    clearNames(videos)
}

async function clearNames(videos) {
    const cleanedVideos = [];
    for (const video of videos) {
        let clearedVideo = {
            ...video,
            name: cleanName(video.name)
        }
        cleanedVideos.push(clearedVideo)
    }
};


async function lockedLinks(newVids, cleanLinks) {
    if (!newVids || newVids.length === 0) return [];
    try {
        if (cleanLinks.length === 0) {
            console.log("Table links is empty")
            return newVids;
        };

        const lockedVideos = new Set(
            cleanLinks
                .filter(vid => vid.locked === true)
                .map(vid => vid.name)
        );

        if (lockedVideos.size === 0) {
            console.log("No locked vidoes found in DB")
            return newVids;
        }

        const canDownload = newVids.filter(vid => {
            const isLocked = lockedVideos.has(vid.name);

            if (isLocked) {
                console.log(`Skiping! Allready locked: ${vid.name}`);
            }
            return !isLocked;
        });
        return canDownload;
    } catch (err) {
        console.error(`❌ Error while sorting lockedLinks `, err.message);
        return [];
    }
};