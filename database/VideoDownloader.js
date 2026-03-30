const { exec } = require("child_process");
const fsPromises = require("fs").promises
const path = require("path");

const config = require('./config')

const VIDEOS_DIR = path.join(__dirname, "videos")

const VIDEO_IMPORTER = path.join(__dirname, "VideoImporter.js");

const COOKIE_EXTRACTOR = path.join(__dirname,"CookieGenerator","CookieExtractor.js")

async function main() {
    if(!(await exists(VIDEOS_DIR))){
        console.error("Missing videos folder");
        return
    }

    try{
       const dbLinks = await getData("VideoForDownload")
       let links = dbLinks.map(video => video.video_url)
       links.reverse();

        let targetFolder = null;
        const subFolders = await fsPromises.readdir(VIDEOS_DIR)

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
                    console.error("All folders are full!");
                    await logWriter("DownloaderLogs","❌ Error: All folders are full");
                    break;
                }
            };
            await VideoDownloader(links[i],i,targetFolder,links);
            
        }
        console.log("🔥 Completed");
    }catch(err){
        console.error(`❌ Error in main loop: ${err.message}`)
    }    
};

async function VideoDownloader(url,index,folderPath,links){
    console.log(`Downdloading: [${index +1}]/${links.length}: ${url}`);

    const comand1 = `yt-dlp -o "${folderPath}/%(title)s.%(ext)s" --cookies youtubeCookies.txt --merge-output-format mp4 "${url}"`;
    const comand2 = `node "${VIDEO_IMPORTER}"`;

    let success = false;
    let attempts = 3;

    while(attempts > 0 && !success){
        try{
            await runComand(comand1);
            console.log("✅ Downloaded");
    
            console.log("📥 Importing downloaded video(s) to DB...");
            await runComand(comand2);
            console.log("✅ Imported successfully");
            await logWriter("DownloaderLogs",`✅ Successfully processed: ${url}`)
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
                await sleep(5000);
            }else{
                console.log(`❌ error while processing ${url}`);
                await logWriter("DownloaderLogs",`❌ Error: ${url} | ${err.message}`)
                await writeFailed("VideoDownloader",`${url}`,`❌ Error while processing url:`, `${err.message}`)
            };
        }
    };
};

async function GenerateCookie() {
    const comand1 = `node "${COOKIE_EXTRACTOR}"`;
    console.log("🍪 Generating fresh cookies");
    try{
        await runComand(comand1);
        await logWriter("DownloaderLogs",`✅ Successfully generated new cookies`)
    }catch(err){
        console.error(`❌ error while generating new cookies : `,err.message);
        await logWriter("DownloaderLogs",`❌ Error: generating new cookies | ${err.message}`);
    }
}

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
            const comand1 = `df -h ${subFolderPath} --output=source | tail -n 1 `;
            const getPartition = await runComand(comand1);
            const partitionName = getPartition.trim()
            
            const comand2 = `df -h --output=avail --block-size=G ${partitionName} | tail -n 1`;
            const getSize = await runComand(comand2);
            const memoryLeft = getSize.trim();
            console.log(`Memory left : ${memoryLeft} gb`)

            const getNumber = parseInt(memoryLeft);
            if(getNumber <= reserveCapacity){
                await  writeInfo(path.join(subFolderPath,'isFull.txt'),memoryLeft)
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

const exists = async (path) =>{
    try{
        await fsPromises.access(path);
        return true;
    }catch{
        return false;
    }
};

async function writeInfo(filePath, data) {
    try{
        await fsPromises.writeFile(filePath,data,'utf-8');
        console.log(`File successfully written: ${filePath}`)
    }catch(err){
        console.error(`❌Error writing: ${err.message}`)
    }
}

function runComand(comand){
    return new Promise((resolve, reject)=>{
        exec(comand,(error, stdout, stderr)=>{
            if(error){
                reject(error);
            }else{
                resolve(stdout || stderr);
            }
        });
    });
};

async function writeFailed (scriptName,videoUrl,developerMessage, compilerMessage) {

    const res = await fetch(`${config.DB_URL}/writeFailed`,{
     method: "POST",
     headers:{"Content-Type":"application/json"},
     body: JSON.stringify({scriptName,videoUrl,developerMessage, compilerMessage})
    });

    if(!res.ok){
     const errorData = await res.text();
     console.error(`❌ Failed writing failed: ${errorData}`);
     return;
    }

    const data = await res.json();
    console.log(data);
 };

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function logWriter (type, message) {

    const res = await fetch(`${config.DB_URL}/addLog`,{
     method: "POST",
     headers:{"Content-Type":"application/json"},
     body: JSON.stringify({type, message})
    });

    if(!res.ok){
     const errorData = await res.text();
     console.error(`❌ Failed writing log: ${errorData}`);
     return;
    }

    const data = await res.json();
    console.log(data);
};

async function getData(dbAddress) {
    try{
        const responce = await fetch(`${config.DB_URL}/${dbAddress}`);
        const data = await responce.json();
        return data;
    }catch(err){
        console.log("DB error: ", err)
    }
};

main();