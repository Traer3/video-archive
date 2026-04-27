const logService = require('../services/logService.js');

exports.addLog = async (req, res) => {
    try {
        const { type, message } = req.body;
        const allowedLogs = [
            "SQLLogs", "ExpressLogs", "DownloaderLogs", "ImporterLogs", "EraserLogs", "IsItUniqueLogs", "ThumbnailGeneratorLogs", "DurationFethcer", "CookieExtractor", "SimulatingDownload"
        ];

        if (!type || !allowedLogs.includes(type)) {
            return (res.status(400).json({ message: "Invalid or Missing type of logs" }));
        };
        const write = await logService.addLog(req.body);
        res.status(200).json({
            message: '✅ Logged successfully',
            data: write
        });
    } catch (err) {
        res.status(500).json({ error: "Error table logs ", err });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const result = await logService.getLogs();
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Table logs error", err })
    }
};

