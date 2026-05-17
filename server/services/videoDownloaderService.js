const path = require("path");
const fsPromises = require("fs").promises

const { addLog } = require("./logService.js");
const { exists, runCommand, sleep, writeInfo } = require("./toolsService.js");
const { videoImporter } = require("./videoImporter/videoImporterService.js");
const { readFolders } = require("./videoService.js");
const { generateThumbnail } = require("./thumbnailGeneratorService.js");
const VIDEOS_DIR = path.join(__dirname, "../videos");

exports.beginDownloadingVideos = async (dbLinks) => {
    if (!(await exists(VIDEOS_DIR))) {
        console.error("Missing video folder");
        return;
    };

    if (dbLinks.length === 0) {
        console.error("❌ No available links");
        return;
    }

    //const fullFolders =  await checkSubFolders();
    
    try {
        let links = dbLinks.reverse();

        let targetFolder = null;
        const subFolders = await fsPromises.readdir(VIDEOS_DIR);
        const findAvailableFolder = async () => {
            for (const subFolder of subFolders) {
                if (await CheckFolderCapacity(VIDEOS_DIR, subFolder)) {
                    return path.join(VIDEOS_DIR, subFolder);
                }
            }
            return null;
        };

        targetFolder = await findAvailableFolder();
        if (!targetFolder) {
            console.error("❌ No available folder");
            return;
        }
        const linkslength = links.length;
        for (let i = 0; i < links.length; i++) {
            let isOk = await CheckFolderCapacity(VIDEOS_DIR, path.basename(targetFolder));
            if (!isOk) {
                console.log("🔄 Current folder full, searching for a new one...");
                targetFolder = await findAvailableFolder();

                if (!targetFolder) {
                    console.error("All folders are FULL!");
                    await addLog({ type: "DownloaderLogs", message: '❌ Error: All folders are full' })
                    break;
                }
            };
            await VideoDownloader(links[i], i, targetFolder, linkslength);
        }

        console.log("🔥 Completed");
        return;
    } catch (err) {
        console.error(`❌ Error in main loop: ${err.message}`);
    }
};

async function VideoDownloader(video, index, folderPath, linkslength) {
    console.log(`Downdloading: [${index + 1}]/${linkslength}: ${video.url}`);
    const command1 = `yt-dlp -o "${folderPath}/%(title)s.%(ext)s" --cookies youtubeCookies.txt --merge-output-format mp4 "${video.url}"`;

    let success = false;
    let attempts = 3;

    while (attempts > 0 && !success) {
        try {
            await runCommand(command1);;
            console.log("✅ Downloaded");

            console.log(`📥 Importing video:  ${video.name}`);
            await videoImporter(video.name)
            console.log("✅ Imported successfully");
            await generateThumbnail(video.name);

            await addLog({ type: "DownloaderLogs", message: `✅ Successfully processed: ${video.url}` });
            success = true;
        } catch (err) {
            attempts--;
            console.log(`⚠️ Attempts left: ${attempts}. Error: ${err.message}`);

            const errorText = err.message + (err.stderr || "");
            const cookieErrorPattern = "Sign in to conf... Эту хуйню нужно опять задетектить блять ";
            if (errorText.includes(cookieErrorPattern)) {
                console.log("Error pattern detected!");
                await GenerateCookie();
            };

            if (attempts > 0) {

                await sleep(5000);
            } else {
                console.log(`❌ error while processing ${video.url}`);
                await addLog({ type: "DownloaderLogs", message: `❌ Error: ${video.url} | ${err.message}` });
            };
        }
    };
};

async function CheckFolderCapacity(mainFolderPath, subFolder) {
    const subFolderPath = path.join(mainFolderPath, subFolder);
    const stats = await fsPromises.stat(subFolderPath);
    let reserveCapacity;

    if (subFolder === "videos1") {
        reserveCapacity = 50;
    } else {
        reserveCapacity = 4;
    }

    if (stats.isDirectory()) {
        //console.log(`Reading folder: ${subFolder}`)
        const files = await fsPromises.readdir(subFolderPath);
        const isFull = files.find(file => file === "isFull.txt")
        if (!isFull) {
            //console.log("Checking subFolder capacity");
            const command1 = `df -h ${subFolderPath} --output=source | tail -n 1 `;
            const getPartition = await runCommand(command1);
            const partitionName = getPartition.trim()

            const command2 = `df -h --output=avail --block-size=G ${partitionName} | tail -n 1`;
            const getSize = await runCommand(command2);
            const memoryLeft = getSize.trim();
            console.log(`Memory left : ${memoryLeft} gb`)

            const getNumber = parseInt(memoryLeft);
            if (getNumber <= reserveCapacity) {
                await writeInfo(path.join(subFolderPath, 'isFull.txt'), memoryLeft)
                return false;
            } else {
                //console.log(`Download video in folder ${subFolder}`)
                return true;
            }
        } else {
            console.log(`Folder ${subFolder} is full`)
            return false;
        }
    }
};

/* потом доработать поиск полных папок 
async function checkSubFolders() {
    const files = await readFolders(VIDEOS_DIR);
    const fullFolders = files.filter(file => file.name === "isFull.txt");
    if (fullFolders.length > 0) {
        const folderPaths = fullFolders.map(folder => folder.fullPath);
        const subFolderNames = folderPaths.map(path => {
            const match = path.match(/\/videos\/([^\/]+)/);
            const result = match ? match[1] : null;
            return result;
        })
        return subFolderNames;
        //subFolderNames:  [ 'videos2', 'videos3' ]
    }
    return null;
}
*/