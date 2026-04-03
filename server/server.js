const app = require('./app.js');
const config = require('./config.js')

//  http://192.168.0.8:3004/api/videos/list

const PORT = config.ExpressServerPort;

app.listen(PORT, ()=>{
    console.log(`🚀 Scalable backend running on port ${PORT}`)
});