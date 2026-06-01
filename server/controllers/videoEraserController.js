const videoEraserService = require("../services/videoEraserService");

exports.deleteVideo = async (req, res) => {
    try {
        const videoId = req.params.id;
        const id = Number(videoId);
        if (!id) {
            return (res.status(400).json({ message: '❌ No video provided for deletion' }));
        }
        const deleteVideo = videoEraserService.deleteVideo(id);
        res.status(200).json({ message: '✅ Video deleted successfully', data: deleteVideo });
    } catch (err) {
        res.status(500).json({ error: `Error deleting video id: ${req.params.id} : ${err}` })
    };
};


exports.deleteThumbnail = async (req, res) => {
    try {
        const { name } = req.params;
        console.log("deleteThumbnail: name : ",name)
        if (!name) {
            return (res.status(400).json({ message: '❌ No video provided for deletion' }));
        }
        console.log("Deleting thum : ", name)
        const deleteThumbnail = videoEraserService.deleteThumbnail(name);
        res.status(200).json({ message: '✅ Thumbnail deleted successfully', data: deleteThumbnail });
    } catch (err) {
        res.status(500).json({ error: `Error deleting thumbnail : ${req.params} : ${err}` })
    };
};


