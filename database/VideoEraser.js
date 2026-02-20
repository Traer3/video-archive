const path = require('path');
const fs = require('fs');
const fsPromises = require("fs").promises

const VIDEOS_DIR = path.join(__dirname, "videos")
const THUMBNAILS_DIR = path.join(__dirname, "thumbnails");

const [,, command, ...videosIdRaw] = process.argv;
const videosId = videosIdRaw.map(id => parseInt(id)).filter(id => !isNaN(id));

if(!videosId || videosId.length === 0) {
    console.log("No video for deletion") 
    return;
}

const exists = async (path) =>{
    try{
        await fsPromises.access(path);
        return true;
    }catch{
        return false;
    }
};

if(!(await exists(VIDEOS_DIR))){
    console.error("Missing videos folder");
}

if(!(await exists(THUMBNAILS_DIR))){
    console.error("Missing thumbnails folder");
}


const mainFolder = fs.readdirSync(VIDEOS_DIR);

const thumbnailFiles = fs.readdirSync(THUMBNAILS_DIR);
console.log(`Thumbnails amount ${thumbnailFiles.length}`)

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
        if(typeof isVideoExited === 'string'){
            console.log(isVideoExited);
            continue;
        }

        let videoName = isVideoExited.name
        
        await deleteVideoInFolder(mainFolder, videoName)
        await deleteThumbnailInFolder(thumbnailFiles, videoName)
        await deleteVideoInDB(isVideoExited.id);

    }
};

async function ThumbnailEraser(thumbnailFiles,videosId) {
    const existingVideos = await  videoFromDB();
    console.log("Ids for deletion: ", videosId)

    for(const id of videosId){
        const isVideoExited = findVideoInDB(existingVideos, id)
        let videoName = isVideoExited.name
    
        deleteThumbnailInFolder(thumbnailFiles, videoName)

        await logWriter("EraserLogs",`✅ Thumbnail deleted: ${videoName}`)
    }
};


async function deleteVideoInDB(videoId) {
    
    const res = await fetch("http://192.168.0.8:3001/deleteVideo",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({videoId: videoId})
    });
    if(res.ok){
        await logWriter("EraserLogs",`✅ Video ${videoId} deleted: `)
    }

    if(!res.ok){
        const errData = await res.json();
        console.error(`Deletion failed: ${errData.message}`);
        await logWriter("EraserLogs",`Deletion id ${videoId} failed: ${errData.message}`)
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
            await logWriter("EraserLogs",`Deletion ${videoName} failed: ${err.message}`)
        }
    } 
}

async function deleteVideoInFolder(mainFolder, videoForDeletion){
    console.log("Searching for file to delete: ",videoForDeletion);
    for(const subFolder of mainFolder){
        const subFolderPath = path.join(VIDEOS_DIR,subFolder);
        
        if(!fs.statSync(subFolderPath).isDirectory()) continue;

        try{
            const filesInSubFolder = fs.readFileSync(subFolderPath);
            
            for(const file of filesInSubFolder){
                if(path.parse(file).name === videoForDeletion){
                    const filePath = path.join(subFolderPath,file);
                    await fsPromises.rm(filePath);
                    console.log(`✅ File deleted: ${file}`);
                    return;
                }
            }
        }catch(err){
            console.error(`Error in folder ${subFolder} `, err.message)
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

/*
//old
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
*/