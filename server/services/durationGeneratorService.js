const path = require('path');
const Ffmpeg = require("fluent-ffmpeg");

const { readFolders, getVideoList, saveVidDuration } = require("./videoService.js");
const { exists } = require("./toolsService");
const { addLog } = require("./logService.js");
const VIDEOS_DIR = path.join(__dirname,"../videos");


exports.durationGenerator = async () => {
    console.log("Saving video duration");
    if(!(await exists(VIDEOS_DIR))){
                console.error("Missing video folder");
                return;
    };
    try{
        const DBvideos = await getVideoList();
        const folderVideos = await readFolders(VIDEOS_DIR);
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
            let folderVideo = folderVideos.find(vid => vid.name === vidName);

            if(folderVideo){
                try{
                    const duration = await getVideoDuration(folderVideo.fullPath)
                    console.log("Duration ",duration);
                    console.log("Id: ", vid.id)
                    await saveVidDuration({vidId: vid.id, vidDurationData: duration})
                    await addLog({
                        type:"DurationFethcer", 
                        message: `✅ Successfully generated for video ${vid.id} , duration ${duration}`
                    });
                }catch(err){
                    console.error(`Error getting duration for ${vidName} : ${err.message}`)
                    await addLog({
                        type:"DurationFethcer", 
                        message: `❌ Error generating duration for video ${vid.id}`
                    });
                }
            }else{
                console.log(`Video not found ${vidName}`)
            };
        }
    }catch(err){
        console.error(`❌ Error generating duration : ', ${err.message}`);
    }
};

async function getVideoDuration(filePath) {
    return new Promise((resolve, reject)=>{
        console.log("filePath ", filePath)
        const absolutePath = path.resolve(filePath)
        Ffmpeg.ffprobe(absolutePath,(err,metadata)=>{
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

