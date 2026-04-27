const linksService = require('../services/linksService');

exports.writeLikes = async (req, res) => {
    try {
        const { name, category, locked, isitunique } = req.body;
        if (!name) {
            return (res.status(400).json({ message: "Missing video name" }))
        }
        const write = await linksService.writeLinks(req.body);
        res.status(200).json({ message: '✅ Links written ', data: write });
    } catch (err) {
        res.status(500).json({ error: "Error  table links ", err });
    };
};

exports.getLinks = async (req, res) => {
    try {
        const likes = linksService.getLinks();
        res.status(200).json(likes);
    } catch (err) {
        res.status(500).json({ error: 'Table links error : ', err })
    }
};

exports.lockedVideo = async (req, res) => {
    try {
        const { id, locked } = req.body;
        if (!id || !locked) {
            return (res.status(400).json({ message: "Missing id or invalid status" }));
        };
        const write = await linksService.lockedVideo(req.body);
        res.status(200).json({
            message: '✅ Filtered successfully',
            data: write
        });
    } catch (err) {
        res.status(500).json({ error: "Error changing state ", err });
    };
};