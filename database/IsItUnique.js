const config = require('./config')

async function main() {
    console.log("Checking unique videos");
    try{
        const DBvideos = await getData("videos");
        const YTLikes = await getData("likes");
        await IsItUnique(DBvideos, YTLikes);
        console.log("🏁 Finished with the checking")
    }catch(err){
        console.log("Error reading DB: ", err.message)
        return []; 
    }
};

async function IsItUnique(DBvideos,YTLikes) {
    try{
        const oldVideos = await ageChecker(DBvideos);
        const oldVideosForCheck = oldVideos.filter(vid => vid.isitunique === false);
        
        const likedNamesSet = new Set(
            YTLikes.map(v => v.video_name)
        );
        const uniqueVideos = oldVideosForCheck.filter(
            vid => !likedNamesSet.has(vid.name)
        );
        
        for(const vid of uniqueVideos){
            console.log(`Vid id: ${vid.id}, name: ${vid.name}, isitunique: true`);
            //включить
            // await saveUniqueData(vid.id,true)
        }
    }catch(err){
        console.error(`Executing IsItUnique: `, err)
    }
}

async function ageChecker(DBvideos) {
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


const saveUniqueData = async (id,isitunique)=>{
    if(!id){
        console.log("Require id");
        return;
    }
    try{
        const res = await fetch(`${config.DB_URL}/saveUniqueData`,{
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                vidId: id,
                isitunique: isitunique,
            }),
        });

        if(res.ok){
            await logWriter("IsItUniqueLogs",`✅ Unique video id: ${id}`)
        }else{
            throw new Error(`Server error: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Updated video: ",data.updatedVideo)
    }catch(err){
        await logWriter("IsItUniqueLogs",`Error saving uniqueData Id ${id},state: ${isitunique}`)
        console.error(`Error saving uniqueData Id ${id},state: ${isitunique}`)
    }
};

async function getData(dbAddress) {
    try{
        const response = await fetch(`${config.DB_URL}/${dbAddress}`);
        const data = await response.json();
        return data;
    }catch(err){
        console.log("DB error: ", err)
    }
};

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

main();

