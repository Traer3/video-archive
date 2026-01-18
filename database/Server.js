const {exec, spawn} = require("child_process");

const fs = require("fs");
const path = require("path");

const SQL_CONNECT = path.join(__dirname,"SQLConnect.js");
const EXPRESS_SERVER = path.join(__dirname,"ExpressServer.js");

if(!fs.existsSync(SQL_CONNECT) || !fs.existsSync(EXPRESS_SERVER)){
    console.log("Missing server files ");
    return;
}

const AUTHORIZE = path.join(__dirname,'LinksGenerator','Authorize.js')
const YT_GET_LINKS = path.join(__dirname,'LinksGenerator','YTGetLinks.js');

if(!fs.existsSync(AUTHORIZE) || !fs.existsSync(YT_GET_LINKS)){
    console.log("Missing Authorize.js || YTGetLinks.js");
    return;
}

const IS_IT_UNIQUE = path.join(__dirname,'IsItUnique.js') 
const VIDEO_DOWNLOADER = path.join(__dirname,'VideoDownloader.js')

if(!fs.existsSync(IS_IT_UNIQUE) || !fs.existsSync(VIDEO_DOWNLOADER)){
    console.log("Error with IsItUnique.js || VideoDownloader.js")
}

const THUMBNAIL_GENERATOR = path.join(__dirname, 'ThumbnailGenerator.js');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function runComand(comand){
    return new Promise((resolve, reject)=>{
        exec(comand,(error,stdout,stderr)=>{
            if(error){
                reject(error);
            }else{
                resolve(stdout || stderr);
            }
        });
    });
}

function deleteOldLinks(comand){
    return new Promise((resolve, reject)=>{
        exec(comand,(error,stdout,stderr)=>{
            if(error){
                reject(console.log("❌Already deleted!"));
            }else{
                resolve(stdout || stderr);
            }
        });
    });
}

async function StartServer() {
    console.log("📥 Booting servers...")
    const SQLConnect = `node "${SQL_CONNECT}"`;
    const ExpressServer = `node "${EXPRESS_SERVER}"`;

    const newSQLTerminal = `gnome-terminal -- /bin/sh -c '${SQLConnect}; exec bash'`
    const newExpressTerminal = `gnome-terminal -- /bin/sh -c '${ExpressServer}; exec bash'`
    
    try{
        await runComand(newSQLTerminal)
        console.log("✅ SQL connected!")

        sleep(2000);

        await runComand(newExpressTerminal)
        console.log("✅ Express server started!");
    }catch(err){
        console.log("❌ Error starting servers ", err);
    }
}

async function Cleanups() {
    
    const UpdateYTdlp = "sudo yt-dlp --update";
    const deleteOldFiles = "rm LinksGenerator/VideoForDownload.txt"
    try{
        console.log("📥 Updating yt-dlp")
        await runComand(UpdateYTdlp);

        console.log("⚠️ Deleting old files...")
        await deleteOldLinks(deleteOldFiles);

    }catch(err){
        console.log("❌ Error during preparation ", err)
    }
}

async function GetingVideos() {
    console.log("📥 Downloading videos...");

    const YTGetLinks = `node "${YT_GET_LINKS}"`;
    const VideoDownloader = `node "${VIDEO_DOWNLOADER}"`;
    const GenerateThumbnails = `node "${THUMBNAIL_GENERATOR}"`;
    const downloadingVideos = `gnome-terminal -- /bin/sh -c '${YTGetLinks}; ${VideoDownloader}; ${GenerateThumbnails}; exec bash'`
    
    await runComand(downloadingVideos);
}

async function ServersReboot() {
    console.log("📥 Rebooting servers...")
    //const killSQLConnect = `pkill -f "node.*${SQL_CONNECT}" || true`;
    //const killExpress = `pkill -f "node.*${EXPRESS_SERVER}" || true`;
    //const ServerKiller = `${killSQLConnect}; ${killExpress}`;
    const killPorts = `fuser -k 3001/tcp; fuser -k 3004/tcp || true`;
    
    await runComand(killPorts);
}

async function main() {
    console.log("Starting maintenance")
    await Cleanups();
    
    await ServersReboot();
    console.log("⏳ Waiting for ports to clear ...")
    await sleep(3000);

    await StartServer();

    await sleep(5000);

    console.log("Checking uniqueness of a video")
    await runComand(`node "${IS_IT_UNIQUE}"`);
 
    //await GetingVideos();

}

main();


//Хоть и скрипт завершиться , но серваки будут работать 
/*
function startBackgroundProcess(scriptPath){
    const process = spawn("node",[scriptPath],{
        stdio: 'inherit',
        detached: true
    });
    process.unref();
    return process;
}

    //запуск
    startBackgroundProcess(SQL_CONNECT)
    console.log("✅ SQL connected!")

    sleep(2000);

    startBackgroundProcess(EXPRESS_SERVER);
    console.log("✅ Express server started!");
*/