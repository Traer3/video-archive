const fsPromises = require("fs").promises
const path = require('path');

const { readFolders, getVideoList, importVideo } = require("./videoService.js");
const { exists } = require("./toolsService.js");
const { addLog } = require("./logService.js");

const VIDEOS_DIR = path.join(__dirname, "../videos");

exports.videoImporter = async () => {
    if (!(await exists(VIDEOS_DIR))) {
        console.error("Missing video folder");
        return;
    };

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
}