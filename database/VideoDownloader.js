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

async function CheckFolderCapacity() {

    //df -h . --output=source | tail -n 1 позволяет увидеть имя раздела в конкретной вызванной папке 
    // /dev/sda1
    const getPartition = `df -h . --output=source | tail -n 1 `;
    const partitionName = await runComand(getPartition);
    const normalPartitionName = partitionName.trim()
    
    //df -h --output=size,used /dev/sdb3 | tail -n 1 
    //получаем только 454G  6.0G
    const getSize = `df -h --output=size,used ${normalPartitionName} | tail -n 1`
    const output = await runComand(getSize)
    const normalOutput = output.trim()
    
    console.log(normalOutput)
    
    
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
   CheckFolderCapacity();
}

main();