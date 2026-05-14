const path = require('path');

const { getVideoList, importVideo } = require("../videoService.js");
const { exists, cleanName } = require("../toolsService.js");
const { addLog } = require("../logService.js");
const { getLinks } = require("../linksService.js");
const { clearNames } = require("../linksGenerator/newNameChecker.js");
const { getVideoSize } = require("./getVideoSize.js");

const VIDEOS_DIR = path.join(__dirname, "../../videos");

exports.videoImporter = async (name) => {
    console.log("name : ",name)
    if (!(await exists(VIDEOS_DIR))) {
        console.error("Missing video folder");
        return;
    };
    const DBvideos = await getVideoList();
    const cleanDBvideos = await clearNames(DBvideos);
    const namesFromDB = new Map(cleanDBvideos.map(video => [video.name, video]))

    try {
        const foundVideo = await getVideoSize(name);
        const answer = await checkDuplicate(namesFromDB, foundVideo);
        if (answer) {
            return answer;
        };
        const categorizedVideo = await checkCategory(foundVideo)
        const uniqueVideo = await uniqueName(categorizedVideo)
        if(!uniqueVideo){
            console.error("Error with uniqueVideo ", uniqueVideo)
        }

        /*
        await importVideo({
            name: uniqueVideo.name,
            duration: uniqueVideo.duration,
            sizeMB: uniqueVideo.sizeMB,
            category: uniqueVideo.category,
            isitunique: false,
            filtered: false
        });
        await addLog({
            type: "ImporterLogs",
            message: `✅ Successfully imported: ${uniqueVideo.name}`
        });
        */
        console.log('Import end')
        return uniqueVideo;
    } catch (err) {
        console.error(`Error in exports.videoImporter:  ${err}`);
        return;
    }
};

async function checkDuplicate(DBvideos, video) {
    if (!video) {
        console.log(`No video provided in checkDuplicate ${video}`);
        return [];
    };
    const normalName = cleanName(video.name);
    const foundVideo = DBvideos.get(normalName);

    if (!foundVideo) {
        const categorizedVideo = await checkCategory(video);
        await importVideo({
            name: categorizedVideo.name,
            duration: categorizedVideo.duration,
            sizeMB: categorizedVideo.sizeMB,
            category: categorizedVideo.category,
            isitunique: false,
            filtered: false
        });
        await addLog({
            type: "ImporterLogs",
            message: `✅ Successfully imported: ${categorizedVideo.name}`
        });
       //console.log('Import end')

        return categorizedVideo;
    };

    if (foundVideo.size_mb === video.sizeMB) {
        console.log(`⚠ Video is duplicate: ${foundVideo.name} (${foundVideo.size_mb} MB)`);
        await addLog({
            type: "ImporterLogs",
            message: `⚠ Video is duplicate: ${foundVideo.name}`
        });
        return true;
    };
}

async function checkCategory(video) {
    const YTLinks = await getLinks() // это потенциальные 2к запроса на один и тот же список 
    const YTLinksClean = await clearNames(YTLinks);
    const YTNames = new Set(YTLinksClean.map(video => video.name))
    const videoName = cleanName(video.name)
    if (YTNames.has(videoName)) {
        return { ...video, category: 'YouTube' }
    } else {
        return video;
    }
}

async function uniqueName(video) {
    const nameMatch = video.name.match(/^(.*)\s\((\d+)\)$/);
    let baseName;
    let currentNumber;
    if (nameMatch) {
        baseName = nameMatch[1];
        currentNumber = parseInt(nameMatch[2]);
    } else {
        baseName = video.name;
        currentNumber = 0;
    }
    const nextNumber = currentNumber + 1;
    const finalName = `${baseName} (${nextNumber})`;

    console.log("Current number: ", currentNumber);
    console.log("Final name: ", finalName);
    return { ...video, name: finalName };

};