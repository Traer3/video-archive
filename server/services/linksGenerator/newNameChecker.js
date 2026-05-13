const { cleanName } = require("../toolsService");


exports.newNameChecker = async (YTVideos, DBvideos, Links) => {
    if (!YTVideos) return;
    try {
        const cleanDBnames = await clearNames(DBvideos);
        const cleanLinks = await clearNames(Links);
        const cleanYTLinks = await clearNames(YTVideos)

        const NamesFromDB = new Set(cleanDBnames.map(video => video.name))

        const newVids = cleanYTLinks.filter(video => {
            const name = video.name;
            const isTrash = name === "private video" || name === "deleted video";
            if (isTrash) return false;
            const isAlreadyInDB = NamesFromDB.has(name);
            return !isAlreadyInDB
        });

        const checkedVideos = await lockedLinks(newVids, cleanLinks);

        return checkedVideos;
    } catch (err) {
        console.error(`Error in newNameChecker : ${err}`)
    }
};

exports.clearNames = (videos) => {
    return clearNames(videos)
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
    return cleanedVideos;
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
                //console.log(`Skiping! Allready locked: ${vid.name}`);
            }
            return !isLocked;
        });
        return canDownload;
    } catch (err) {
        console.error(`❌ Error while sorting lockedLinks `, err.message);
        return [];
    }
};