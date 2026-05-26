const { runCommand, exists } = require("../services/toolsService");
const { configTemplate } = require("./configTemplate");
const { creatIcon } = require("./creatIcon");
const { creatFolders } = require("./folderCreator");
const { getIP, getPort } = require("./serverData");
const { terminal } = require("./terminalTalk");


async function Setup() {
    const location = await getLocation();
    
    const checkFilesExistens = await checkFiles(location)
    if(checkFilesExistens) return null;

    await creatFolders(location)
    
    const serverData = await getServerData();
    const SQLData = await SQLAuthorization();

    await configTemplate(serverData,SQLData,location);
    const icon = await creatIcon(location);
    console.log(`You can edit config.js in \n${location.server}+/config.js`);

    await deleteSetup(location);

    return icon;
};

async function checkFiles(location, silent = false) {
    let configExistens = false;
    let foldersExistens = false;
    if(await exists(`${location.server}config.js`)){

        if(!silent){
            console.log("⚠ config.js already exist!")
        }
        configExistens = true;
    }
    if(await exists(`${location.server}videos`) && await exists(`${location.server}thumbnails`)){
        if(!silent){
            console.log("⚠ Folders thumbnails && videos already exist!")
        }
        
        foldersExistens = true;
    };

    if(configExistens && foldersExistens){
        return true;
    }else{
        return null;
    }
}

async function deleteSetup(location) {
    const checkFilesExistens = await checkFiles(location,true)
    if(checkFilesExistens){
        const command = `rm -R ${location.server}setup`
        await runCommand(command);
    }
}

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