const fsPromises = require("fs").promises
const path = require("path");

exports.readVideoFolders = async (videosDir) => {
    const videos = [];
        try{
            const subFolders = await fsPromises.readdir(videosDir);
            for(const folderName of subFolders){
                const fullPath = path.join(videosDir,folderName);
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