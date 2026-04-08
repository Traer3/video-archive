const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController.js');
const videoDownloaderService = require('../services/videoDownloaderService.js');


router.get('/videos',videoController.getVideos);
router.get('/videoList',videoController.getVideoList);
router.get('/:videoName',videoController.getVideo);
router.get('/thumbnails/:thumbnailName',videoController.getThumbnail);
//router.get('/authorize',videoController.authorize);

router.get('/download-test',async (req,res)=>{
    try{
        videoDownloaderService.beginDownloadingVideos();
        res.json({message: "Downloader start in background."})
    }catch(err){
        res.status(500).json({error: err.message});
    }
})


router.post('/filterVideo',videoController.filterVideo);
router.post('/deleteVideo',videoController.deletedVideo);
router.post('/importVideo',videoController.importVideo);
router.post('/saveVidDuration',videoController.saveVidDuration);
router.post('/saveUniqueData',videoController.saveUniqueData);


module.exports = router;