const path = require('path');
const fs = require('fs');

const VIDEOS_DIR =  path.join(__dirname, "videos");
const THUMBNAILS_DIR = path.join(__dirname, "thumbnails");

const [,, command, ...videosIdRaw] = process.argv;
const videosId = videosIdRaw.map(id => parseInt(id)).filter(id => !isNaN(id));
console.log("Как приходят ids ",videosId)

if(!videosId || videosId.length === 0) {
    console.log("No video for deletion") 
    return;
}

if(!fs.existsSync(VIDEOS_DIR)){
    console.error("Missing videos folder");
};

if(!fs.existsSync(THUMBNAILS_DIR)){
    console.error("Missing thumbnails folder");
};

const videoFiles = fs.readdirSync(VIDEOS_DIR);
console.log(`Videos amount ${videoFiles.length}`)

const thumbnailFiles = fs.readdirSync(THUMBNAILS_DIR);
console.log(`Thumbnails amount ${thumbnailFiles.length}`)

async function videoFromDB() {
    try{
        const responce = await fetch("http://192.168.0.8:3001/videos");

        if(!responce.ok){
            throw new Error(`Cant get videos from server status: ${responce.status}`)
        }

        const data = await responce.json();

        return data;
    }catch(err){
        console.error(`Cant get videos from Server 3001: ${err.message}`);
        return [];
    }
}




async function VideoEraser(videosId) {
    const existingVideos = await videoFromDB();
    console.log("Ids for deletion: ", videosId)
    
    for(const id of videosId){
        const isVideoExited = findVideoInDB(existingVideos, id)
        let videoName = isVideoExited.name
    
        deleteVideoInFolder(videoFiles, videoName)
        deleteThumbnailInFolder(thumbnailFiles, videoName)
        deleteVideoInDB(isVideoExited.id);
    }
};

async function ThumbnailEraser(thumbnailFiles,videosId) {
    const existingVideos = await  videoFromDB();
    console.log("Ids for deletion: ", videosId)

    for(const id of videosId){
        const isVideoExited = findVideoInDB(existingVideos, id)
        let videoName = isVideoExited.name
    
        deleteThumbnailInFolder(thumbnailFiles, videoName)

    }
};


async function deleteVideoInDB(videoId) {
    
    const res = await fetch("http://192.168.0.8:3001/deleteVideo",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({videoId: videoId})
    });
    if(!res.ok){
        const errData = await res.json();
        console.error(`Deletion failed: ${errData.message}`);
        return;
    }
    const data = await res.json();
    return data
}

function findVideoInDB(existingVideos, IDforDeletion){
    const video = existingVideos.find(vid =>
        vid.id === IDforDeletion
    )
    if(!video){
        return `DB dont have id ${IDforDeletion}`
    }
    return video;
}

async function deleteThumbnailInFolder(thumbnailFiles, videoName) {
    console.log("Deleting thumbnail for: ", videoName);

    for(const file of thumbnailFiles){
        const filePath = path.join(THUMBNAILS_DIR, file);
        try{
            const originalFileName = path.parse(file).name
            if(originalFileName === videoName){
                
                await fs.promises.rm(filePath,{recursive:true});
                console.log(`File deleted: ${videoName}`)
            }

        }catch(err){
            console.error("Error while executing deleteThumbnailInFolder ", err.message)
        }
    } 
}

async function deleteVideoInFolder(videoFiles, videoForDeletion){
    console.log("Video name",videoForDeletion)

    for(const file of videoFiles){
        const filePath = path.join(VIDEOS_DIR, file);
        try{
            const originalFileName = path.parse(file).name
            if(originalFileName === videoForDeletion){
            
                await fs.promises.rm(filePath,{recursive:true});
                console.log(`File deleted: ${videoName}`)
            }

        }catch(err){
            console.error("Error while executing deleteVideoInFolder ", err.message)
        }
    } 
}


VideoEraser(videosId)




if(require.main === module){
    (async ()=>{
        if(!videosId){
            console.error('❌ No video provided for deletion');
            process.exit(1);
        }
        if(command === 'fullErasing'){
            await VideoEraser(videosId);
        }else if(command === 'thumbnailDeletion'){
            await ThumbnailEraser(thumbnailFiles, videoName);
        }
    })
}