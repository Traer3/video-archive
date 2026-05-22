const express = require("express");
const cors = require("cors");
const requestLogger = require("./middleware/logger.js");
const videoRoutes = require('./routes/videoRoutes.js');
const log = require('./routes/logRoutes.js');
const authorize = require('./routes/authorizeRoutes.js');
const { VideoDownloader } = require("./VideoDownloader.js");
const { checkUniqueness } = require("./services/uniquenessService.js");
const devTools = require('./routes/devToolsRoutes.js');
const { updateYTdlp } = require("./services/autoUpdate/YTdlpService.js");

const app = express();
app.use(cors());
app.use(express.json());

app.use(requestLogger);

app.use('/api/server', videoRoutes);

app.use('/api/log', log);

app.use('/api/auth', authorize);

app.use('/dev',devTools)

async function startCycle(cycleFunction, hours) {
    try {
        await cycleFunction();
    } catch (err) {
        console.error(err)
    } finally {
        console.log(`🕧 Wait for the next ${hours} hours...`)
        setTimeout(startCycle, hours * 60 * 60 * 1000);
    };
};

//Включить
//startCycle(checkUniqueness,24)
//startCycle(VideoDownloader,6)
//startCycle(updateYTdlp,24);

module.exports = app;

