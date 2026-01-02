const fs = require('fs');
const {authorizeByHand} = require ('./LinksGenerator/Authorize');
const {google} = require('googleapis');

const DB_URL = 'http://192.168.0.8:3001'

    const getVideos = async () => {
        try{
            const responce = await fetch(`${DB_URL}/videos`);
            const data = await responce.json();
            IsItUnique(data)
        }catch(err){
            
        }
    }
    getVideos();

    const savaUniqueData = async (id,isisunique)=>{
        if(!id){
            console.log("Require id");
            return;
        }
        try{
            const res = await fetch(`${DB_URL}/saveUniqueData`,{
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({
                    vidId: id,
                    isisunique: isisunique,
                }),
            });

            if(!res.ok){
                throw new Error(`Server error: ${res.status}`);
            }
            
            const data = await res.json();
            console.log("Updated video: ",data.updatedVideo)
        }catch(err){
            console.error(`Error saving uniqueData Id ${id},state: ${isisunique}`)
        }
    }

    
    async function IsItUnique(DBvideos) {
        try{
            const YTLikesNames = await authorizeByHand().then(getYTLikesNames).catch(console.error);
            const oldVideos = await ageCheker(DBvideos);
            const oldVideosForCheck = oldVideos.filter(vid => vid.isitunique === false);
            
            const likedNamesSet = new Set(
                YTLikesNames.map(v => v.name)
            );

            const uniqueVideos = oldVideosForCheck.filter(
                vid => !likedNamesSet.has(vid.name)
            );
            
            uniqueVideos.forEach(vid => {
                console.log(`Vid id: ${vid.id}, name: ${vid.name}, isitunique: true`);
                //ПОДСТАВИТЬ ЗНАЧЕНИЯ vid.id И НОВЫЙ СТАТУС true
                //savaUniqueData(5008,true)

            });
            
            return uniqueVideos;

        }catch(err){
            console.error(`Exequning IsItUnique: `, err)
        }
    }

    async function ageCheker(DBvideos) {
        const now = Date.now();
        const DAY_24H = 24 * 60 * 60 * 1000;
        const oldVideos = [];

        for(const vid of DBvideos){
            const videoTime = new Date(vid.created_at).getTime();
            const diff = now - videoTime;

            if(diff < DAY_24H){
                continue;
            }
            oldVideos.push(vid);
        };
        return oldVideos;
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
                const name = item.snippet.title;
                allVideos.push({name});
            });
            nextPageToken = res.data.nextPageToken;
            console.log(`Loaded: ${allVideos.length} so far...`);
            if(allVideos.length >= 50) break //временные тормоза
        }while(nextPageToken);

        return allVideos;
    }


