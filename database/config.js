const os = require('os')
const SQL_PORT = 3001;
const EXPRESS_PORT = 3004;
const STATIC_IP = '192.168.0.9'

const platform = process.platform;

function getLocalIP () {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)){
        for(const net of interfaces[name]){
            if(net.family === 'IPv4' && !net.internal){
                return net.address;
            }
        }
    }
    return '127.0.0.1';
}

const IP = (platform === 'win32') ? STATIC_IP : getLocalIP();

if(platform !== 'win32'){
    console.log("Linux detected. Adaptive IP:",IP);
}else{
    console.log("Windows detected. Static IP:",IP);
}


module.exports = {
    SQLConnectPort: SQL_PORT,
    ExpressServerPort: EXPRESS_PORT,
    DB_URL: `http://${IP}:${SQL_PORT}`,
    VIDEO_URL: `http://${IP}:${EXPRESS_PORT}`,
    TABLE_AUTHORIZATION:{
        user: "postgres",
        host: "localhost",
        database: "Vids",
        password: "Wedfvb01",
        port: 5432,
    }
}
