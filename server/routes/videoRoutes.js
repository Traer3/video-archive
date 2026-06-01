const express = require('express');
const router = express.Router();
const { getVideoList, getVideos, getVideo, getThumbnail, filterVideo, deleteID, importVideo, saveVidDuration, saveUniqueData, getYTVideos } = require('../controllers/videoController.js');

const durationGeneratorService = require('../services/durationGeneratorService.js')
const { generateThumbnails, generateThumbnail } = require('../services/thumbnailGeneratorService.js');
const { checkUniqueness } = require('../services/uniquenessService.js');

const { deleteVideo, deleteThumbnail } = require('../controllers/videoEraserController.js');

const { videoImporter } = require('../services/videoImporter/videoImporterService.js');
const { YTGetLinks } = require('../services/linksGenerator/linksGeneratorService.js');
const { beginDownloadingVideos } = require('../services/videoDownloaderService.js');
const { updateYTdlp } = require('../services/autoUpdate/YTdlpService.js');

router.get('/videos', getVideos);
router.get('/videoList', getVideoList);
router.get('/YTVideos', getYTVideos);

router.get('/:videoName', getVideo);
router.get('/thumbnails/:thumbnailName', getThumbnail);

router.delete('/deleteVideo/:id', deleteVideo);
router.delete('/deleteThumbnail/:name', deleteThumbnail); //эту хуйню 

router.get('/yt', async (req, res) => {
    try {
        await updateYTdlp();
        res.json({ message: "auth start in background." })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/down-test', async (req, res) => {
    try {
        await beginDownloadingVideos()
        res.json({ message: "auth start in background." })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/auth-test', async (req, res) => {
    try {
        await YTGetLinks()
        res.json({ message: "auth start in background." })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/uniq-test', async (req, res) => {
    try {
        checkUniqueness();
        res.json({ message: "uniq start in background." })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/duration-test', async (req, res) => {
    try {
        durationGeneratorService.durationGenerator()
        res.json({ message: "duration start in background." })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/import-test', async (req, res) => {
    try {
        const testName = ""
        await videoImporter(testName)
        res.json({ message: "duration start in background." })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/thumbnail-test', async (req, res) => {
    try {
        await generateThumbnails()
        res.json({ message: "duration start in background." })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/filterVideo', filterVideo);
router.post('/deleteID', deleteID);
router.post('/importVideo', importVideo);
router.post('/saveVidDuration', saveVidDuration);
router.post('/saveUniqueData', saveUniqueData);


module.exports = router;