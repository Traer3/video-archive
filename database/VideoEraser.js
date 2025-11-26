const path = require('path');
const fs = require('fs');

const VIDEOS_DIR =  path.join(__dirname, "videos");
const THUMBNAILS_DIR = path.join(__dirname, "thumbnails");

const [,, command, videos] = process.argv;

const testIds = [4960]

if(!fs.existsSync(VIDEOS_DIR)){
    console.error("Missing videos folder");
};

if(!fs.existsSync(THUMBNAILS_DIR)){
    console.error("Missing thumbnails folder");
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
    const result = [];
    if(!videosId || videosId.length === 0) {
        console.log("No video for deletion") 
        return;
    }
    console.log("Starting erasing videos");
    console.log("Ids for deletion: ", videosId)

    const existingVideos = await videoFromDB();
    console.log(`DB have ${existingVideos.length} videos`);
    //console.log(existingVideos)

    for(const id of videosId){
        const isVideoExited = findVideoFromDB(existingVideos, id)
        //deleteVideo(isVideoExited.id);
    }

    //const videoFolder = fs.readFileSync(VIDEOS_DIR);
};


async function deleteVideo(videoId) {
    
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

async function thumbnailEraser(videoName) {
    
}

function findVideoFromDB(existingVideos, IDforDeletion){
    return(existingVideos.find(video =>
        video.id === IDforDeletion
    ));
}

VideoEraser(testIds)

























if(require.main === module){
    (async ()=>{
        if(!videos){
            console.error('❌ No video provided for deletion');
            process.exit(1);
        }
        if(command === 'fullErasing'){
            //await fullErasing(videos);
        }else if(command === 'thumbnailDeletion'){
            //await thumbnailDeletion(videos);
        }
    })
}