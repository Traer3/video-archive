const { exec } = require("child_process");
const fs = require("fs");
const fsPromises = require("fs").promises
const path = require("path");

const VIDEOS_LINKS_PATH = path.join(__dirname, 'LinksGenerator', 'VideoForDownload.txt')
const FAILED_FILE = path.join(__dirname, "failed.txt")

const VIDEOS_DIR = path.join(__dirname, "videos")

const VIDEO_IMPORTER = path.join(__dirname, "VideoImporter.js")

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

async function readMyFile(filePath) {
    try{
        const content = await fsPromises.readFile(filePath,'utf-8');
        return content
    }catch(err){
        console.error(`❌Error reading file ${filePath} `,err.message)
        return null;
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
}

async function VideoDownloader(url,index,folderPath,links){
    console.log(`Downdloading: [${index +1}]/${links.length}: ${url}`);

    const comand1 = `yt-dlp -o "${folderPath}/%(title)s.%(ext)s" --merge-output-format mp4 "${url}"`;
    const comand2 = `node "${VIDEO_IMPORTER}"`;

    try{
        await runComand(comand1);
        console.log("✅ Downloaded");

        console.log("📥 Importing downloaded video(s) to DB...");
        await runComand(comand2);
        console.log("✅ Imported successfully");

        await logWriter("DownloaderLogs",`✅ Successfully processed: ${url}`)
    }catch(err){
        console.log(`❌ error while processing ${url} :`,err.message);
        await logWriter("DownloaderLogs",`❌ Error: ${url} | ${err.message}`)
        fsPromises.appendFile(FAILED_FILE,url + "\n");
    }
    
}

async function CheckFolderCapacity(mainFolderPath,subFolder) {
    const subFolderPath = path.join(mainFolderPath,subFolder)
    const stats = await fsPromises.stat(subFolderPath);
    if(stats.isDirectory()){
        console.log(`Reading folder: ${subFolder}`)
        const files = await fsPromises.readdir(subFolderPath);
        const isFull = files.find(file => file === "isFull.txt")
        if(!isFull){
            console.log("Checking subFolder capacity");

            const comand1 = `df -h ${subFolderPath} --output=source | tail -n 1 `;
            const getPartition = await runComand(comand1);
            const partitionName = getPartition.trim()
                
            const comand2 = `df -h --output=avail ${partitionName} | tail -n 1`;
            const getSize = await runComand(comand2);
            const memoryLeft = getSize.trim();

            const getNumber = parseInt(memoryLeft);
            if(getNumber <= 4){
                await  writeInfo(path.join(subFolderPath,'isFull.txt'),memoryLeft)
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

async function logWriter (type, message) {

    const res = await fetch('http://192.168.0.8:3001/addLog',{
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

async function main() {
    if(!(await exists(VIDEOS_DIR))){
        console.error("Missing videos folder");
        return
    }

    await writeInfo(FAILED_FILE, "")

    try{
        const fileContent = await readMyFile(VIDEOS_LINKS_PATH);
        if(!fileContent) return;
        
        const links = fileContent
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);

        if(links.length === 0){
            console.log("📭 No links to download.");
            return;
        }

        const mainFolder = await fsPromises.readdir(VIDEOS_DIR)
        let targetFolder = null;
        for(const subFolder of mainFolder){
            const isOk = await CheckFolderCapacity(VIDEOS_DIR,subFolder);
            if(isOk){
                targetFolder = path.join(VIDEOS_DIR,subFolder);
                break;
            }
        }
        if(targetFolder){
            for (let i = 0; i < links.length; i++){
                await VideoDownloader(links[i], i,targetFolder,links);
            }
            await writeInfo(VIDEOS_LINKS_PATH,"")
            console.log("🔥 Completed");
        }else{
            console.error("❌ No available folder for download (all full or missing)");
            await logWriter("DownloaderLogs","❌ Error: All folders are full.");
        }
    }catch(err){
        console.error(`❌ Error in main loop: ${err.message}`)
    }
     
}

main();

/* old 1
    //df -h . --output=source | tail -n 1 позволяет увидеть имя раздела в конкретной вызванной папке 
    // /dev/sda1
    const comand2 = `df -h . --output=source | tail -n 1 `;
    const getPartition = await runComand(comand2);
    const partitionName = getPartition.trim()
    
    //df -h --output=size,used /dev/sdb3 | tail -n 1 
    //получаем только 454G  6.0G
    const comand3 = `df -h --output=avail ${partitionName} | tail -n 1`;
    const getSize = await runComand(comand3);
    const memoryLeft = getSize.trim();
    
    const getNumber = memoryLeft.replace(/\G$/i, '')
    if(getNumber <= 4){
        fs.writeFileSync('isFull.txt',memoryLeft)
    }
*/

/* old 2
const { exec } = require("child_process");

const fs = require("fs");
const path = require("path");

const VIDEOS_LINKS_PATH = path.join(__dirname, 'LinksGenerator', 'VideoForDownload.txt')
const FAILED_FILE = path.join(__dirname, "failed.txt")
const OUT_DIR = path.join(__dirname, "videos")
const VIDEO_IMPORTER = path.join(__dirname, "VideoImporter.js")

if(!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

fs.writeFileSync(FAILED_FILE, "");

const links = fs.readFileSync(VIDEOS_LINKS_PATH, "utf-8")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

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
}


async function VideoDownloader(url,index){
    console.log(`Downdloading: [${index +1}]/${links.length}: ${url}`);

    const comand1 = `yt-dlp -o "${OUT_DIR}/%(title)s.%(ext)s" --merge-output-format mp4 "${url}"`;
    const comand2 = `node "${VIDEO_IMPORTER}"`;

    try{
        await runComand(comand1);
        console.log("✅ Downloaded");

        console.log("📥 Importing downloaded video(s) to DB...");
        await runComand(comand2);
        console.log("✅ Imported successfully");

        await logWriter("DownloaderLogs",`✅ Successfully processed: ${url}`)
    }catch(err){
        console.log(`❌ error while processing ${url} :`,err.message);
        await logWriter("DownloaderLogs",`❌ Error: ${url} | ${err.message}`)
        fs.appendFileSync(FAILED_FILE, url + "\n");
    }
    
}


async function logWriter (type, message) {

    const res = await fetch('http://192.168.0.8:3001/addLog',{
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

async function main() {
    for (let i = 0; i < links.length; i++){
        await VideoDownloader(links[i], i);
    }
    fs.writeFileSync(VIDEOS_LINKS_PATH, "");
    console.log("🔥 Completed")
    
}

main();
*/