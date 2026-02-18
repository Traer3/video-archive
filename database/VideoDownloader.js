const { exec } = require("child_process");

const fs = require("fs");
const path = require("path");

const VIDEOS_LINKS_PATH = path.join(__dirname, 'LinksGenerator', 'VideoForDownload.txt')
const FAILED_FILE = path.join(__dirname, "failed.txt")

const VIDEOS_DIR = path.join(__dirname, "TestVideos") // TYT

const VIDEO_IMPORTER = path.join(__dirname, "VideoImporter.js")

if(!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR);
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

    const comand1 = `yt-dlp -o "${VIDEOS_DIR}/%(title)s.%(ext)s" --merge-output-format mp4 "${url}"`;
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

async function CheckFolderCapacity(folderPath) {
    //const comand1 = ``
    const fsPromises = require("fs").promises
    const mainFolder = await fsPromises.readdir(folderPath)

    for(const subFolder of mainFolder){
        const subFolderPath = path.join(folderPath,subFolder)
        const stats = await fsPromises.stat(subFolderPath);
        if(stats.isDirectory()){
            console.log(`Reading folder: ${subFolder}`)
            const files = await fsPromises.readdir(subFolderPath);
            const isFull = files.find(file => file === "isFull.txt")
            if(!isFull){
                console.log("FolderIsEmpty")
            }else{
                console.log(`Folder ${subFolder} is full`)
            }
        }
    }

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

    //const thumbnailName = file.replace(/\.mp4$/i, '.jpg');
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
    /*
    for (let i = 0; i < links.length; i++){
        await VideoDownloader(links[i], i);
    }
    fs.writeFileSync(VIDEOS_LINKS_PATH, "");
    console.log("🔥 Completed")
    */
   CheckFolderCapacity(VIDEOS_DIR);
}

main();