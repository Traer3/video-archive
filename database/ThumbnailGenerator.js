const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
//npm install fluent-ffmpeg

const VIDEOS_DIR =  path.join(__dirname, "videos");
const OUTPUT_DIR = path.join(__dirname, "./thumbnails");

if(!fs.existsSync(OUTPUT_DIR)){
    fs.mkdirSync(OUTPUT_DIR);
}
async function generateThumbnail(videoPath, outputPath){
    return new Promise((resolve, reject)=>{
        ffmpeg(videoPath)
            .on('end', ()=> resolve(outputPath))
            .on('error',(err)=> reject(err))
            .screenshot({
                count: 1,
                timemarks: ['00:00:02.000'],
                filename: path.basename(outputPath),
                folder: OUTPUT_DIR,
                size: '320x240',
            });
    });
}

async function processAllVideos() {
    const files = fs.readdirSync(VIDEOS_DIR).filter(f => f.endsWith('.mp4'));

    for(const file of files){
        const videoPath = path.join(VIDEOS_DIR, file);
        const outputPath = path.join(OUTPUT_DIR, `${path.parse(file).name}.jpg`);
        

        try{
            console.log(`🎬 Generating thumbnail for: ${file}`);
            await generateThumbnail(videoPath, outputPath);
            console.log(`✅ Thumbnail generated : ${outputPath}`);
        }catch(err){
            console.error(`❌ error ${file}:`, err.message);
        }
    }
}

processAllVideos()
