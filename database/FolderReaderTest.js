const fs = require("fs").promises;
const path = require("path");
const VIDEOS_DIR = path.join(__dirname, "TestVideos");

async function FolderReader() {
    const videos = [];

    try{
        const subFolders = await fs.readdir(VIDEOS_DIR);
        for(const folderName of subFolders){
            const fullPath = path.join(VIDEOS_DIR,folderName);
            const stats = await fs.stat(fullPath);

            if(stats.isDirectory()){
                console.log(`--- Reading folder: ${folderName} ---`);
                const videoFiles = await fs.readdir(fullPath);
                videoFiles.map(file => {
                    videos.push(file);
                });
            }
        }
        return videos;
    }catch(err){
        console.error("Error reading directories: ",err.message);
        return [];
    };
    
}

async function main() {
    const videos =  await FolderReader();
    console.log(videos)
    
    
}

main()

/*
fs.readdir(VIDEOS_DIR, (err,subFolders)=>{
       if(err) return console.error("Error reading main videos directory");
       subFolders.map(folderName =>{
        const fullPath = path.join(VIDEOS_DIR,folderName);
        if(fs.statSync(fullPath).isDirectory()){
            console.log(`--- Reading folder: ${folderName} ---`);
            const videoFiles = fs.readdirSync(fullPath);
            videoFiles.map(file =>{
                //console.log(`Found video: ${file}`)
                videos.push(file);
            })
        }
       })
    })
*/