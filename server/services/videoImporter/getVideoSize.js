const path = require('path');
const fsPromises = require("fs").promises

const { cleanName, deleteExtension } = require("../toolsService");
const { readFolders } = require("../videoService");

const VIDEOS_DIR = path.join(__dirname, "../../videos");

exports.getVideoSize = async (videoName) =>{
    const files = await readFolders(VIDEOS_DIR);
    try{
        const normalName = cleanName(videoName);
        for (const file of files) {
            const fileName = deleteExtension(file.name);
            const filePath = file.fullPath
            const cleanedName = cleanName(fileName);
            if (cleanedName === normalName) {
                const stat = await fsPromises.stat(filePath);
                const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
                return{
                    name: videoName,
                    duration: "",
                    sizeMB: sizeMB,
                    category: ''
                }
            }
        };
        console.log("Video not found! ", videoName)
        return null
    }catch(err){
        console.error(`❌ Error with ${videoName} : ${err}`)
        return null
    };
};