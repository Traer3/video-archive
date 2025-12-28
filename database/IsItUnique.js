const fs = require('fs');
const {authorizeByHand} = require ('./LinksGenerator/Authorize');
const {google} = require('googleapis');
const path = require('path');

const VIDEO_DIR = path.join(__dirname, 'videos');

const getVideos = async () => {
    try{

    }catch(err){
        
    }
}

async function IsItUnique(videoFolder) {
    try{
        if(!fs.existsSync(videoFolder)){
            console.error(`Can't find folder: ${videoFolder}`);
            return;
        }
        const files = fs.readdirSync(videoFolder);
        console.log(`Files amount: ${files.length}`);

        const YTLikesNames = await authorizeByHand().then(getYTLikesNames).catch(console.error);

    }catch(err){
        
    }
}

async function getYTLikesNames(auth) {
    const service = google.youtube('v3');
    let nextPageToken = null;
    const allVideos = [];

    do{
        const res = await service.playlistItems.list({
            playlistId: 'LL',
            part:['snippet','contentDetails'],
            maxResults: 50,
            pageToken: nextPageToken || undefined,
            auth,
        });

        res.data.items.forEach(item => {
            const name = item.contentDetails.videoId;
            allVideos.push({name});
        });
        nextPageToken = res.data.nextPageToken;
        console.log(`Loaded: ${allVideos.length} so far...`);
        if(allVideos.length >= 50) break //временные тормоза
    }while(nextPageToken);

    return allVideos;
}