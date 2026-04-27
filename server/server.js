const app = require('./app.js');
const config = require('./config.js')

const PORT = config.ExpressServerPort;

app.listen(PORT, () => {
    console.log(`🚀 Scalable backend running on port ${PORT}\nhttp://192.168.0.8:3001/api/server/videos`)
});