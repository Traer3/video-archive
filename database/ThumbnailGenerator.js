const fsPromises = require("fs").promises
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const config = require('./config')

const VIDEOS_DIR = path.join(__dirname, "videos")
const THUMBNAILS_DIR = path.join(__dirname, "thumbnails");


async function main() {
    try{
        console.log("🔍 Checking main folder")
        await fsPromises.mkdir(THUMBNAILS_DIR,{recursive: true});

        const mainFolder = await fsPromises.readdir(VIDEOS_DIR);

        for(const subFolder of mainFolder){
            const subFolderPath = path.join(VIDEOS_DIR,subFolder);
            const stats = await fsPromises.stat(subFolderPath);
            if(stats.isDirectory()){
                console.log(`\n 📂 Entering directory: ${subFolder}`);
                await processAllVideos(subFolderPath)
            }
        };
        console.log("\n🏁 All Folders processed!");
    }catch(err){
        console.error("🔥 Error in main loog: ",err.message)
    }
};

async function generateThumbnail(videoPath, outputPath){
    return new Promise((resolve, reject)=>{
        ffmpeg(videoPath)
            .on('end', ()=> resolve(outputPath))
            .on('error',(err)=> reject(err))
            .screenshot({
                count: 1,
                timemarks: ['00:00:02.000'],
                filename: path.basename(outputPath),
                folder: THUMBNAILS_DIR,
                size: '320x240',
            });
    });
}

async function processAllVideos(folderPath) {
    const files = await readDirAsync(folderPath);
    const existingThumbnails = await readDirAsync(THUMBNAILS_DIR)

    for(const file of files){
        const videoPath = path.join(folderPath, file);

        let stats;
        try{
            stats = await fsPromises.stat(videoPath);
        }catch(err){
            console.error(`Error with ${file}`);
            continue;
        }

        if(!stats.isFile() || !file.endsWith('.mp4')){
            continue;
        }

        const nameOnly = path.parse(file).name;
        const thumbnailName = `${nameOnly}.jpg`;
        const outputPath = path.join(THUMBNAILS_DIR, thumbnailName);
        
        if(existingThumbnails.includes(thumbnailName)){
            console.log(`Skipping duplicates: ${thumbnailName}`);
            continue;
        }
        
        try{
           console.log(`🎬 Generating thumbnail for: ${file}`);
           await generateThumbnail(videoPath, outputPath);
           console.log(`✅ Thumbnail generated : ${thumbnailName}`);
           await logWriter("ThumbnailGeneratorLogs",`✅ Thumbnail generated : ${thumbnailName}`)
          
        }catch(err){
            console.error(`❌ error ${file}:`, err.message);
            await logWriter("ThumbnailGeneratorLogs",`❌ error ${file}: ${err.message}`)
        }
    }
};

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

async function readDirAsync(folderPath) {
    try{
        return await fsPromises.readdir(folderPath);
    }catch(err){
        console.error(`❌Error reading file ${folderPath} `,err.message)
        return [];
    }
}

main();