const express = require('express');
const router = express.Router();
const { getVideoList, getVideos, getVideo, getThumbnail, filterVideo, deletedVideo, importVideo, saveVidDuration, saveUniqueData } = require('../controllers/videoController.js');

const videoDownloaderService = require('../services/videoDownloaderService.js');



router.get('/videos',getVideos);
router.get('/videoList',getVideoList);
router.get('/:videoName',getVideo);
router.get('/thumbnails/:thumbnailName',getThumbnail);
//router.get('/authorize',videoController.authorize);

router.get('/download-test',async (req,res)=>{
    try{
        videoDownloaderService.beginDownloadingVideos();
        res.json({message: "Downloader start in background."})
    }catch(err){
        res.status(500).json({error: err.message});
    }
})


router.post('/filterVideo',filterVideo);
router.post('/deleteVideo',deletedVideo);
router.post('/importVideo',importVideo);
router.post('/saveVidDuration',saveVidDuration);
router.post('/saveUniqueData',saveUniqueData);


module.exports = router;