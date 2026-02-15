const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
//npm install fluent-ffmpeg

//ТУТ
const VIDEOS_DIR =  path.join(__dirname, "videos");
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
