const { creatIcon } = require("./creatIcon");
const { getIP } = require("./getIP");
const { getPort } = require("./getPort");
const { terminal } = require("./terminalTalk");

async function Setup() {
    //похуй , потом использую 
    //const icon = await creatIcon();
    //console.log("creatIcon : ", icon);

    const serverData = await getServerData();
    const SQLData = await SQLAuthorization();

    console.log("User data: \n", serverData,"\n", SQLData )
    return;
};

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