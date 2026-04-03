const express = require("express");
const cors = require("cors");
const requestLogger = require("./middleware/logger.js");
const videoRoutes = require('./routes/videoRoutes.js');
const failedRoutes = require('./routes/failedRoutes.js');
const lockedVideosRoutes = require('./routes/lockedVideosRoutes.js')

const app = express();
app.use(cors());
app.use(express.json());

app.use(requestLogger);

//app.use('/api/videos',videoRoutes);

app.use('/api/failed',failedRoutes);
app.use('/api/lockedVideos',lockedVideosRoutes);

module.exports = app;

