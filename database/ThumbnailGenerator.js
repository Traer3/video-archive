const fs = require('fs');
const fsPromises = require("fs").promises
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
//npm install fluent-ffmpeg

const VIDEOS_DIR = path.join(__dirname, "videos")
const THUMBNAILS_DIR = path.join(__dirname, "thumbnails");

const exists = async (path) =>{
    try{
        await fsPromises.access(path);
        return true;
    }catch{
        return false;
    }
};
if(!(await exists(THUMBNAILS_DIR))){
    fs.mkdirSync(THUMBNAILS_DIR);
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
    const files = fs.readdirSync(folderPath)
    const existingThumbnails = fs.readdirSync(THUMBNAILS_DIR)

    for(const file of files){
        const videoPath = path.join(folderPath, file);
        if(!fs.statSync(videoPath).isFile() || !file.endsWith('.mp4')){
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
}

async function main() {
    try{
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
}

main()

/*
OLD
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
//npm install fluent-ffmpeg


const VIDEOS_DIR =  path.join(__dirname, "TestVideos");
const THUMBNAILS_DIR = path.join(__dirname, "thumbnails");

if(!fs.existsSync(THUMBNAILS_DIR)){
    fs.mkdirSync(THUMBNAILS_DIR);
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

async function processAllVideos() {
    const files = fs.readdirSync(VIDEOS_DIR).filter(f => f.endsWith('.mp4'));
    const thumbnails = fs.readdirSync(THUMBNAILS_DIR)

    for(const file of files){
        const videoPath = path.join(VIDEOS_DIR, file);
        const outputPath = path.join(THUMBNAILS_DIR, `${path.parse(file).name}.jpg`);
        const name = `${path.parse(file).name}.jpg`
        
        if(thumbnails.includes(name)){
            continue;
        }
        
        try{
           console.log(`🎬 Generating thumbnail for: ${file}`);
           await generateThumbnail(videoPath, outputPath);
           await logWriter("ThumbnailGeneratorLogs",`✅ Thumbnail generated : ${outputPath}`)
           console.log(`✅ Thumbnail generated : ${outputPath}`);
        }catch(err){
            console.error(`❌ error ${file}:`, err.message);
            await logWriter("ThumbnailGeneratorLogs",`❌ error ${file}: ${err.message}`)
        }
    }
}

processAllVideos()

*/