const fsPromises = require("fs").promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg')
const config = require('./config');
const VIDEOS_DIR = path.join(__dirname, "videos")


async function main() {
    console.log("Saving video duration");
    const DBvideos = await getDBData();
    const folderVideos = await FolderReader();

    if(!DBvideos || !folderVideos){
        console.log("DBvideos or folderVideos empty");
        return;
    }

    for(const vid of DBvideos){
        if(vid.duration){
            console.log(`⏭️ Already has duration: ${vid.name}`);
            continue;
        };

        let vidName = vid.name+'.mp4'
        let folderVideo = folderVideos.find(vid => vid.name === vidName)

        if(folderVideo){
            try{
                const duration = await getVideoDuration(folderVideo.fullPath)
                console.log("Duration ",duration);
                console.log("Id: ", vid.id)
                //await saveVideoDuration(vid.id , duration)
                //await logWriter("DurationFethcer",`Generated for video ${vid.id} , duration ${duration}`)
               
            }catch(err){
                console.error(`Error getting duration for ${vidName} && ${err.message}`)
                //await logWriter("DurationFethcer",`❌ Error generating duration for video ${vid.id} `)
            }
        }else{
            console.log(`Video not found ${vidName}`)
        };
    }
};

async function getVideoDuration(filePath) {
    return new Promise((resolve, reject)=>{
        console.log("filePath ", filePath)
        const absolutePath = path.resolve(filePath)
        ffmpeg.ffprobe(absolutePath,(err,metadata)=>{
            if(err){
                console.error("FFprobe for path:",absolutePath)
                return reject(err);
            }
            const duration = metadata.format.duration;
            const minutes = Math.floor(duration / 60);
            const seconds =  Math.floor(duration % 60) ;
            const formatted = `${minutes}:${seconds.toString().padStart(2,"0")}`
            resolve(formatted);
        })
    })
};

const saveVideoDuration = async (vidId, vidDuration) =>{
    if(!vidId || !vidDuration) {
        console.log("⚠️ Missing video id or duration")
        return;
    }

    try{
        const res = await fetch(`${config.DB_URL}/saveVidDuration`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                vidId: vidId,
                vidDurationData: vidDuration,
            }),
        });

        if(!res.ok){
            throw new Error(`Server error:  ${res.status}`);
        }

        const data = await res.json();
        console.log(`⏱ Duration saved for video ${vidId} : ${vidDuration}`)
        console.log("✅Updated video: ", data.updatedVideo);
                
    }catch(err){
        console.error('❌ Error saving video: ', err);
    }
};

const getDBData = async () => {
    try{
        const res = await fetch(`${config.DB_URL}/videos`);
        const arr = await res.json();
        const formatted = arr.map(v => ({
            id: v.id,
            name: v.name,
            tumbnail: v.thumbnail,
            duration: v.duration,
            isitunique: v.isitunique,
            filtered: v.filtered
        }));
        const filtered = formatted.filter(vid => !vid.duration)

        console.log('DB videos loaded:',formatted.length);
        return filtered

       
    }catch(err){
        console.log("Error loading DB videos:", err);
        return []
    }
};

async function FolderReader() {
    const videos = [];
    try{
        const subFolders = await fsPromises.readdir(VIDEOS_DIR);
        for(const folderName of subFolders){
            const fullPath = path.join(VIDEOS_DIR,folderName);
            const stats = await fsPromises.stat(fullPath);

            if(stats.isDirectory()){
                console.log(`--- Reading folder: ${folderName} ---`);
                const videoFiles = await fsPromises.readdir(fullPath);
                videoFiles.map(file => {
                    videos.push({
                        name: file,
                        fullPath:path.join(fullPath, file)
                    });
                });
            }
        }
        return videos;
    }catch(err){
        console.error("Error reading directories: ",err.message);
        return [];
    }; 
}

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

main ();