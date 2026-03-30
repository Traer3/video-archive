const fsPromises = require("fs").promises;
const path  = require("path");
const {Pool} = require("pg");

const config = require("./config");
const VIDEOS_DIR = path.join(__dirname, "videos");

const pool = new Pool(config.TABLE_AUTHORIZATION);

async function main() {
    console.log("Sorting videos id DB");
    console.log("📂 Searching video from Folders");
    const folderVideos = await FolderReader();
    const likedVideos =  await getData("likes");
    
    const sortedList = await SortedList(likedVideos,folderVideos)
    await DatabaseOverwrite(sortedList)
};

const SortedList = async (likedList, folderVideos) =>{
    const existedVidoes = [];
    const likedListName = likedList.map(video => video.video_name)
    const resersLikedList = likedListName.reverse()

    resersLikedList.map(vid => {
        let finedVideo = folderVideos.find(folderVid => {
            let formatedName = vid + ".mp4"
            return folderVid.name === formatedName
        })
        if(finedVideo){
            existedVidoes.push(finedVideo)
        }
    });
    
    return existedVidoes;
    
};

const importVideos = async (videoData) => {
    const res =  await fetch(`${config.DB_URL}/importVideo`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(videoData)
    });
    
    if(!res.ok){
        const errorData = await res.json();
        console.error(`❌ Imoirt failed: ${errorData.message}`);
        await logWriter("ImporterLogs",`❌Imoirt failed: ${errorData.message}`)
        return;
    }

    const data = await res.json();
    console.log(data);
};

const DatabaseOverwrite= async (newList) => {
    console.log("🔄 Rewriting old DB");
    try{
        await pool.query(`TRUNCATE TABLE videos RESTART IDENTITY`);
        console.log("Table videos RESTARTED");

        for(const video of newList){
            const filePath = video.fullPath;
            const stat = await fsPromises.stat(filePath);
            if(stat.isFile()){
                const originalName = path.parse(video.name).name;
                const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
                
                await importVideos({
                    name: originalName,
                    duration: "",
                    sizeMB: sizeMB,
                    category: 'YouTube',
                });
            };
         }
    }catch(err){
        console.error("❌ Database logging failed: ",err.message);
    };  
};

async function getData(dbAddress) {
    try{
        const responce = await fetch(`${config.DB_URL}/${dbAddress}`);
        const data = await responce.json();
        return data;
    }catch(err){
        console.log("DB error: ", err)
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
};


main();
