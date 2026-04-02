const videoService = require('../services/videoService.js');
const path = require("path");
const fsPromises = require("fs").promises
const config = require('../config.js')


const VIDEOS_DIR = path.join(__dirname,"./videos");
const THUMBNAILS_DIR = path.join(__dirname, "./thumbnails");
const AUTHNIFICATION = path.join(__dirname,"Authorize.js");

exports.getVideos = async (req,res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    try{
        const allVideos = await videoService.readVideoFolders(VIDEOS_DIR);
        if(allVideos.length === 0){
                    return res.status(200).json({videos:[],total:0});
                }
        
                const fileteredFiles = allVideos.filter(v => v.name.match(/\.(mp4|mov|mkv|webm|avi)$/i));
                const filesWithStats = await Promise.all(
                    fileteredFiles.map(async (file)=>{
                        try{
                            const stats = await fsPromises.stat(file.fullPath);
                            return {...file, mtime: stats.mtime};
                        }catch(err){
                            return {...file, mtime: 0};
                        }
                    })
                );
        
                const sortedFiles = filesWithStats.sort((a,b)=> b.mtime - a.mtime);
                        
                const paginatedFiles = sortedFiles.slice(startIndex, endIndex);
                
                const thumbnails = await fsPromises.readdir(THUMBNAILS_DIR);
        
                const videoList = paginatedFiles.map((v)=>{
                    const file = v.name;
                    const thumbnailName = file.replace(/\.mp4$/i, '.jpg');
                    const hasThumbnail = thumbnails.includes(thumbnailName);
                    return{
                        name: file,
                        url: `${config.VIDEO_URL}/${encodeURIComponent(file)}`,
                        thumbnail: hasThumbnail
                            ?  `${config.VIDEO_URL}/thumbnails/${encodeURIComponent(thumbnailName)}`
                            : null,
                    };
                });
            
        
                res.json({
                    page,
                    total: sortedFiles.length,
                    hasNext: endIndex < sortedFiles.length,
                    videos: videoList
                });
    }catch(err){
        console.error(err);
        res.status(500).json({error: err.message});
    }
};

exports.authorize = async (req,res)=> {
    try{
        const output = await videoService.runScript(AUTHNIFICATION,['getUrl']);
        const urlMatch = output.match(/https?:\/\/[^\s]+/);
        res.json({url: urlMatch ? urlMatch[0] : null});
    }catch(err){
        res.status(500).json({error: err.message});
    }
}