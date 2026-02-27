const SQL_PORT = 3001;
const EXPRESS_PORT = 3004;
const IP = '192.168.0.8';

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