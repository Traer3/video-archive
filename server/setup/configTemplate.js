const { writeInfo } = require("../services/toolsService");

exports.configTemplate = async (serverData, SQLAuthorization,location) => {
    if (!serverData || !SQLAuthorization) {
        console.error(`Error in configTemplate , missing data`);
        return null;
    };

    const configLocation = location.server + '/config.js'

    const template = `
    const SERVER_PORT = ${serverData.port};
    const STATIC_IP = '${serverData.ip}';

    module.exports = {
       SERVER_PORT: \`\${SERVER_PORT}\`,
       SERVER_URL: \`http://\${STATIC_IP}:\${SERVER_PORT}\`,
       TABLE_AUTHORIZATION: {
            user: "${SQLAuthorization.user}",
            host: "${SQLAuthorization.host}",
            database: "${SQLAuthorization.database}",
            password: "${SQLAuthorization.password}",
            port: ${SQLAuthorization.port},
        }
    }
    `

    await writeInfo(configLocation, template);
    console.log(`✅ Config.js created in ${configLocation}`)
    return true;
}