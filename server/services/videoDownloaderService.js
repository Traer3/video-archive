const path = require("path");
const fsPromises = require("fs").promises
const toolsService = require('./toolsService.js');
const logService = require('../services/logService.js');
const failedService = require('../services/failedService.js')
const VIDEOS_DIR = path.join(__dirname,"../videos");

exports.beginDownloadingVideos = async (dbLinks) => {
    if(!(await toolsService.exists(VIDEOS_DIR))){
        console.error("Missing video folder");
        return;
    };
    try{
        //const dbLinks = await getData("VideoForDownload") ПОЛУЧАЕМ ССЫЛКИ
        const dbLinks = [
            {
                name: "test1",
                url: "https://youtu.be/tP4ZhMxzdXI?si=NaRNX8nYRglPhetc"
            },
            {
                name: "test2",
                url: "https://youtu.be/iPhgfQLDruc?si=jXFLVEEKXjvV1LM3"
            }
        ];
        let links = dbLinks.map(video => video.url);
        links.reverse();

        let targetFolder = null;
        const  subFolders = await fsPromises.readdir(VIDEOS_DIR);
        const findAvailableFolder = async () => {
            for(const subFolder of subFolders){
                if(await CheckFolderCapacity(VIDEOS_DIR,subFolder)){
                    return path.join(VIDEOS_DIR,subFolder);
                }
            }
            return null;
        };
        
        targetFolder = await findAvailableFolder();
        if(!targetFolder){
            console.error("❌ No available folder");
            return;
        }

        for(let i = 0; i < links.length; i++){
            let isOk = await CheckFolderCapacity(VIDEOS_DIR, path.basename(targetFolder));
            if(!isOk){
                console.log("🔄 Current folder full, searching for a new one...");
                targetFolder = await findAvailableFolder();

                if(!targetFolder){
                    console.error("All folders are FULL!");
                    await logService.addLog({type:"DownloaderLogs", message: '❌ Error: All folders are full'});
                    break;
                }
            };
            await VideoDownloader(links[i],i,targetFolder,links);
        }
        console.log("🔥 Completed");
    }catch(err){
        console.error(`❌ Error in main loop: ${err.message}`);
    }
};

async function VideoDownloader(url,index,folderPath,links){
    console.log(`Downdloading: [${index +1}]/${links.length}: ${url}`);

    const command1 = `yt-dlp -o "${folderPath}/%(title)s.%(ext)s" --cookies youtubeCookies.txt --merge-output-format mp4 "${url}"`;
    //const command2 = `node "${VIDEO_IMPORTER}"`;

    let success = false;
    let attempts = 3;

    while(attempts > 0 && !success){
        try{
            await toolsService.runCommand(command1);;
            console.log("✅ Downloaded");
    
            console.log("📥 Importing downloaded video(s) to DB...");
            //await toolsService.runCommand(command2);;
            console.log("✅ Imported successfully");
            await logService.addLog({type:"DownloaderLogs", message: '✅ Successfully processed: ${url}'});
            success = true;
        }catch(err){
            attempts--;
            console.log(`⚠️ Attempts left: ${attempts}. Error: ${err.message}`);

            const errorText = err.message + (err.stderr || "");
            const cookieErrorPattern = "Sign in to conf... Эту хуйню нужно опять задетектить блять ";
            if(errorText.includes(cookieErrorPattern)){
                console.log("Error pattern detected!");
                await GenerateCookie();
            };

            if(attempts > 0){
                await toolsService.sleep(5000);
            }else{
                console.log(`❌ error while processing ${url}`);
                await logService.addLog({type:"DownloaderLogs", message: `❌ Error: ${url} | ${err.message}`});
                await failedService.writeFailed({
                    scriptName:"VideoDownloader",
                    videoUrl: `${url}`,
                    developerMessage: `❌ Error while processing url:`,
                    compilerMessage: `${err.message}`
                });
            };
        }
    };
};

async function CheckFolderCapacity(mainFolderPath,subFolder) {
    const subFolderPath = path.join(mainFolderPath,subFolder);
    const stats = await fsPromises.stat(subFolderPath);
    let reserveCapacity;

    if(subFolder === "videos1"){
        reserveCapacity = 50;
    }else{
        reserveCapacity = 4;
    }

    if(stats.isDirectory()){
        console.log(`Reading folder: ${subFolder}`)
        const files = await fsPromises.readdir(subFolderPath);
        const isFull = files.find(file => file === "isFull.txt")
        if(!isFull){
            console.log("Checking subFolder capacity");
            const command1 = `df -h ${subFolderPath} --output=source | tail -n 1 `;
            const getPartition = await toolsService.runCommand(command1);
            const partitionName = getPartition.trim()
            
            const command2 = `df -h --output=avail --block-size=G ${partitionName} | tail -n 1`;
            const getSize = await toolsService.runCommand(command2);
            const memoryLeft = getSize.trim();
            console.log(`Memory left : ${memoryLeft} gb`)

            const getNumber = parseInt(memoryLeft);
            if(getNumber <= reserveCapacity){
                await toolsService.writeInfo(path.join(subFolderPath,'isFull.txt'),memoryLeft)
                return false;
            }else{
                console.log(`Download video in folder ${subFolder}`)
                return true;
            }
        }else{
            console.log(`Folder ${subFolder} is full`)
            return false;
        }
    }
}