const { ChildProcess, exec } = require("child_process");

const fs = require("fs");
const path = require("path");

const VIDEOS_LINKS_PATH = path.join(__dirname, "links.txt")
const FAILED_FILE = path.join(__dirname, "failed.txt")
const OUT_DIR = path.join(__dirname, "videos")

if(!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

fs.writeFileSync(FAILED_FILE, "");

const links = fs.readFileSync(VIDEOS_LINKS_PATH, "utf-8")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

function VideoDownloader(url,index){
    return new Promise((resolve)=>{
        console.log(`Downdloading: [${index +1}]/${links.length}: ${url}`);

        const comand = `yt-dlp -o "${OUT_DIR}/%(title)s.%(ext)s" "${url}"`;
        exec(comand,(error, stdout,stderr) => {
            if (error) {
                console.log(`❌ error while downloaded: ${url}`);
                fs.appendFileSync(FAILED_FILE, url + "\n");
            }else{
                console.log(`✅ Downloaded`);
            }
            resolve();
        });
    });
}

async function main() {
    for (let i = 0; i < links.length; i++){
        await VideoDownloader(links[i], i);
    }
    console.log("🔥 Completed")
}

main();