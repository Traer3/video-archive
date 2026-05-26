const { runCommand } = require("../services/toolsService");
const { configTemplate } = require("./configTemplate");
const { creatIcon } = require("./creatIcon");
const { creatFolders } = require("./folderCreator");
const { getIP, getPort } = require("./serverData");
const { terminal } = require("./terminalTalk");

async function Setup() {
    const location = await getLocation();
    //похуй , потом использую 
    //const icon = await creatIcon(); //требует desktopLocation и serverPath , потом передашь 
    //console.log("creatIcon : ", icon);
    const res = creatFolders(location)
    console.log("folder res: ", res); 
    return;
    
    const serverData = await getServerData();
    const SQLData = await SQLAuthorization();

    //await configTemplate(serverData,SQLData,location)

    return;
};

async function getLocation() {
    const getLocation = `pwd`
    const location = await runCommand(getLocation)
    const cleanLocation = location.stdout.trim();
    const desktopLocation = cleanLocation.replace(/^(\/home\/[^/]+).*/, '$1/Desktop');
    const serverPath = cleanLocation.replace("/setup","/");
    return {server: serverPath, desktop: desktopLocation}
}

async function getServerData() {
    const serverData = {
        ip:'',
        port:'',
    }
    const userIP =  await getIP()
    serverData.ip = await terminal(`Enter server ip:`,userIP);
    serverData.port = await terminal(`Enter server port:`,3001);
    
    return serverData;
}

async function SQLAuthorization() {
    const SQLPort = await getPort()

    const SQLConfig ={
        user: "",
        host: "",
        database: "",
        password: "",
        port: "",
    };
    const keys = Object.keys(SQLConfig)
    console.log("Enter authorization data for SQL")

    for(const key of keys){
        if(key === 'user'){
            SQLConfig[key] = await terminal(`Eter sql ${key}`,'postgres');
            continue;
        }
        if(key === 'host'){
            SQLConfig[key] = await terminal(`Eter sql ${key}`,'localhost');
            continue;
        }
        if(key === 'port'){
            SQLConfig[key] = await terminal(`Enter sql ${key}`,SQLPort)
            continue;
        };
        SQLConfig[key] = await terminal(`Enter sql ${key}`)
    }
    return SQLConfig;
}



Setup();