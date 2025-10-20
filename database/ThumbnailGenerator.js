const fs = require('fs');
const path = require('path');


const VIDEO_URL = 'http://192.168.0.8:3004'
//const FOLDER_PATH = path.join(__dirname, "videos")
//const files = fs.readdirSync(FOLDER_PATH);
//console.log(`Files amount: ${files.length}`)

//const originalName = path.parse(file).name;
//const clearName = originalName.replace(/\.mp4$/i, '');
const thumbnailGenerator = async () => {
    try{
        const urlResponse = await fetch(`${VIDEO_URL}/videos?page=1&limit=1000000`);
        const urlData = await urlResponse.json();
        const urls = urlData.videos;
        for(let vid of urls){
            let VideoUrl = String(vid.url);
            const {uri} = await VideoThumbnails
        }
        showDATA()
    }catch(err){

    }

}

thumbnailGenerator()
