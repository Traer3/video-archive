const fsPromises = require("fs").promises
const path = require('path');

const { readFolders, getVideoList, importVideo } = require("../videoService.js");
const { exists, cleanName } = require("../toolsService.js");
const { addLog } = require("../logService.js");
const { getLinks } = require("../linksService.js");
const { clearNames } = require("../linksGenerator/newNameChecker.js");

const VIDEOS_DIR = path.join(__dirname, "../../videos");

exports.videoImporter = async (name) => {
    if (!(await exists(VIDEOS_DIR))) {
        console.error("Missing video folder");
        return;
    };
    const DBvideos = await getVideoList();
    const cleanDBvideos = await clearNames(DBvideos);
    const namesFromDB = new Set(cleanDBvideos.map(video => video.name))
    const testName = "【ブルアカ】7th PV"
    const foundVideo = await findVideo(testName);
    
    if(foundVideo){
        console.log("answer : ", foundVideo);
        await checkDuplicate(namesFromDB, foundVideo)
    }

    return;

    const files = await readFolders(VIDEOS_DIR);
    console.log(`Files amount: ${files.length}`);
    const existingVideos = await getVideoList();
    console.log(`DB already have ${existingVideos.length} vids`);

    let importedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
        const filePath = file.fullPath
        try {
            const stat = await fsPromises.stat(filePath);
            if (stat.isFile() && isVideoFile(file.name)) {
                const originalName = path.parse(file.name).name;
                const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
                const duplicate = findDuplicate(existingVideos, originalName, sizeMB);

                if (duplicate) {
                    console.log(`⏩ Scip duplicate: ${originalName} (${sizeMB} MB)`);
                    skippedCount++;
                    continue;
                }

                const finalName = await generateUniqueName(existingVideos, originalName);
                const duration = "";

                await importVideo({
                    name: finalName,
                    duration: duration,
                    sizeMB: sizeMB,
                    category: 'YouTube',
                });
                await addLog({
                    type: "ImporterLogs",
                    message: `✅ Successfully imported: ${finalName}`
                });
                existingVideos.push({ name: finalName, size_mb: sizeMB });
                console.log(`✅ Added: ${finalName} (${sizeMB} MB)`);
                importedCount++;
            }
        } catch (err) {
            console.error(`ERROR cant reed file ${file.name}:`, err.message)
        };
    };
    console.log('\n📊 RESULTS:');
    console.log(`Added new files: ${importedCount}`);
    console.log(`Skiped duplicates: ${skippedCount}`);
    console.log('Import end')
};

function isVideoFile(fileName) {
    const videoExtensions = ['.mp4'];
    return videoExtensions.includes(path.extname(fileName).toLocaleLowerCase());
};

function findDuplicate(existingVideos, name, sizeMB) {
    return existingVideos.find(video =>
        video.name === name && video.size_mb === sizeMB
    );
};

async function generateUniqueName(existingVideos, baseName) {
    const sameNameVideos = existingVideos.filter(video =>
        video.name.startsWith(baseName)
    );

    if (sameNameVideos.length === 0) {
        return baseName;
    }

    let maxNumber = 0;
    const pattern = new RegExp(`^${baseName}\\((\\d+)\\)$`);

    sameNameVideos.forEach(video => {
        const match = video.name.match(pattern);
        if (match) {
            const num = parseInt(match[1]);
            if (num > maxNumber) {
                maxNumber = num;
            }
        }
    });

    const hasOriginal = existingVideos.some(video => video.name === baseName);
    if (hasOriginal && maxNumber === 0) {
        maxNumber = 1;
    }
    return maxNumber > 0 ? `${baseName} (${maxNumber + 1})` : baseName;
};

async function findVideo(videoName) {
    const normalName = await cleanName(videoName);
    const files = await readFolders(VIDEOS_DIR);
    for (const file of files) {
        const fileName = file.name.replace(/\.mp4$/i, '');
        const filePath = file.fullPath
        const cleanedName = await cleanName(fileName);
        if(cleanedName === normalName){
            console.log("File in folder!");
            const stat = await fsPromises.stat(filePath);
            const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
            return {
                name: videoName,
                duration: "",
                sizeMB: sizeMB,
                category: ''
            }
        };
    };
};

async function checkDuplicate(DBvideos,video) {
    
}


/*
async function videoImporter() {
    const DBvideos = await getVideoList();
    const YTvideos = await getLinks();
    const cleanDBvideos = await clearNames(DBvideos);
    const cleanYTnames = await clearNames(YTvideos);
    const namesFromDB = new Set(cleanDBvideos.map(video => video.name))
    const namesFromYT = new Set(cleanYTnames.map(vid => vid.name));

    const newVideos = cleanYTnames.filter(video => {
        const alreadyExisted = namesFromDB.has(video.name)
        if(alreadyExisted){
            //console.log(`Video : ${video.name} already existed`)
        }
        return !alreadyExisted;
    });


    
   
    const nv = cleanYTnames.map(vid => {
        const alreadyExisted = namesFromDB.has(vid.name)
        if(!alreadyExisted){
            return vid.name;
        }
    });
    console.log("nv: ",nv)

    //const files = await readFolders(VIDEOS_DIR);

    //videoName получаем когда будем проходится по списку cleanYTnames выискивая порядок 
    const reverseYTnames = cleanYTnames.reverse()
    
    const sortedVideos = reverseYTnames.filter(vid=>{
        const foundVideo = namesFromYT.has(vid.name);
        if(foundVideo){
            return foundVideo;
        }
    });

    //await importingVideos(files,DBvideos,cleanDBvideos,namesFromYT,videoName);
    console.log("sortedVideos : ", sortedVideos)
    
};
*/

async function importingVideos(files, DBvideos, cleanDBvideos, namesFromYT, videoName) {
    for (const file of files) {
        const filePath = file.fullPath
        const fileName = path.parse(file.name).name;
        const cleanedName = cleanName(fileName)
        if (cleanedName !== videoName) {
            console.log("Cant find file in video folders");
            return;
        }

        try {
            const stat = await fsPromises.stat(filePath);
            if (stat.isFile() && isVideoFile(file.name)) {
                const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
                const duplicate = findDuplicate(cleanDBvideos, cleanedName, sizeMB);

                if (duplicate) {
                    console.log(`⏩ Scip duplicate: ${originalName} (${sizeMB} MB)`);
                    skippedCount++;
                    continue;
                }

                const finalName = await generateUniqueName(DBvideos, originalName);
                const duration = "";
                if (!namesFromYT.has(cleanedName)) {
                    await importVideo({
                        name: finalName,
                        duration: duration,
                        sizeMB: sizeMB,
                        category: 'personal',
                    });
                } else {
                    await importVideo({
                        name: finalName,
                        duration: duration,
                        sizeMB: sizeMB,
                        category: 'YouTube',
                    });
                }

                await addLog({
                    type: "ImporterLogs",
                    message: `✅ Successfully imported: ${finalName}`
                });
                //existingVideos.push({ name: finalName, size_mb: sizeMB });
                console.log(`✅ Added: ${finalName} (${sizeMB} MB)`);
                //importedCount++;
            }
        } catch (err) {
            console.error(`ERROR cant reed file ${file.name}:`, err.message)
        };
    };
}