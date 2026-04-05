const videoService = require('../services/videoService.js');
const path = require("path");
const fsPromises = require("fs").promises
const config = require('../config.js')

const VIDEOS_DIR = path.join(__dirname,"../videos");
const THUMBNAILS_DIR = path.join(__dirname, "../thumbnails");


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

exports.getVideoList = async(req,res) => {
    try{
        const getVideoList = await videoService.getVideoList();
        if(!getVideoList){
            res.status(400).json({
                message:'❌ SQL empty'
            })
        }else{
            res.status(200).json({
                message:'✅ Videos from DB',
                data: getVideoList
            })
        }
    }catch(err){
        res.status(500).json({error: "Table videos error",err});
    }
}

exports.filterVideo = async(req,res) => {
    try{
        const {id, state} = req.body;
        if(!id || !state) {
            return(res.status(400).json({message: "Missing id or invalid status"}));
        };
        const write = await videoService.filterVideo(req.body);
        res.status(200).json({
            message:'✅ Filtered successfully',
            data: write
        });
    }catch(err){
        res.status(500).json({error:"Error changing state ", err});
    };
};

exports.deletedVideo = async(req,res) => {
    try{
        const {videoId} = req.body;
        if(!videoId) {
            return(res.status(400).json({message: "Missing video id  for deletion"}));
        }
        const deleteVideo = await videoService.deleteVideo(req.body);
        res.status(200).json({
            message:'✅ Deleted successfully',
            data: deleteVideo
        });
    }catch(err){
        res.status(500).json({error: 'Error wihle deleting video: ',err});
    }
}

exports.importVideo = async(req,res) => {
    try{
        const {name, duration, sizeMB,category} = req.body;
        if(!name) {
            return res.status(400).json({message: "Missing video name"});
        };
        const importVideo = await videoService.importVideo(req.body);
        res.status(200).json({
            message:  '✅ Video imported successfully',
            data: importVideo
        });
    }catch(err){
        res.status(500).json({message: `Server cant import vid: ${err.message}`})
    }
};

exports.saveVidDuration = async(req,res) => {
    try{
        const {vidId, vidDurationData} = req.body;
        if(!vidId || !vidDurationData){
            return res.status(400).json({message: "Missing video ID or duration"});
        }
        const write = await videoService.saveVidDuration(req.body);
        res.status(200).json({
            message:  '✅ Video duration saved successfully',
            data: write
        });
    }catch(err){
        res.status(500).json({message: 'Server error', error: e.message})
    }
};

exports.saveUniqueData = async(req,res) =>{
    try{
        const {vidId, isitunique} = req.body;
        if(!vidId){
            return res.status(400).json({message: "Missing video ID"});
        }
        const write = await videoService.saveUniqueData(req.body);
        res.status(200).json({
            message: '✅ Video is unique',
            data: write
        });
    }catch(err){
        res.status(500).json({message: 'Server error', error: err.message});
    };
}