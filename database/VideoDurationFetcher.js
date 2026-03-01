const config = require('./config');
const fsPromises = require("fs").promises;
const path = require('path');
const VIDEOS_DIR = path.join(__dirname, "videos")


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
        const filtered = formatted.filter(vid => vid.duration === '')

        console.log('DB videos loaded:',formatted.length);
        return filtered

       
    }catch(err){
        console.log("Error loading DB videos:", err);
        return []
    }
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
        savedIds.current.add(vidId);
        console.log(`⏱ Duration saved for video ${vidId} : ${vidDuration}`)
        console.log("✅Updated video: ", data.updatedVideo);
                
    }catch(err){
        console.error('❌ Error saving video: ', err);
    }
}

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

async function main() {
    console.log("Saving video duration");
    const DBvideos = [];
    DBvideos.push( await getDBData())
    //console.log(DBvideos)

    const folderVideos = [];
    folderVideos.push( await FolderReader())

    const noDurationVids = [];

    folderVideos.map(vid => console.log(vid[0]))

    for(const dbVid of DBvideos){
        noDurationVids.push(folderVideos.map(vid => {
           vid[0].name === dbVid.name
        }))
    }
    
}

main ()