const express = require('express');
const router = express.Router();
const { getVideoList, getVideos, getVideo, getThumbnail, filterVideo, deletedVideo, importVideo, saveVidDuration, saveUniqueData } = require('../controllers/videoController.js');

const durationGeneratorService = require('../services/durationGeneratorService.js')
const importVideoService = require('../services/videoImporterService.js');
const { thumbnailGenerator } = require('../services/thumbnailGeneratorService.js');


router.get('/videos',getVideos);
router.get('/videoList',getVideoList);
router.get('/:videoName',getVideo);
router.get('/thumbnails/:thumbnailName',getThumbnail);
//router.get('/authorize',videoController.authorize);

router.get('/duration-test',async (req,res)=>{
    try{
        durationGeneratorService.durationGenerator()
        res.json({message: "duration start in background."})
    }catch(err){
        res.status(500).json({error: err.message});
    }
});

router.get('/import-test',async (req,res)=>{
    try{
        importVideoService.videoImporter()
        res.json({message: "duration start in background."})
    }catch(err){
        res.status(500).json({error: err.message});
    }
});

router.get('/thumbnail-test',async (req,res)=>{
    try{
        thumbnailGenerator()
        res.json({message: "duration start in background."})
    }catch(err){
        res.status(500).json({error: err.message});
    }
});


router.post('/filterVideo',filterVideo);
router.post('/deleteVideo',deletedVideo);
router.post('/importVideo',importVideo);
router.post('/saveVidDuration',saveVidDuration);
router.post('/saveUniqueData',saveUniqueData);


module.exports = router;