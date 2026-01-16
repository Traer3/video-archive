const {exec} = require("child_process");

const fs = require("fs");
const path = require("path");

const SQL_CONNECT = path.join(__dirname,"SQLConnect.js");
const EXPRESS_SERVER = path.join(__dirname,"ExpressServer.js");

if(!fs.existsSync(SQL_CONNECT) || !fs.existsSync(EXPRESS_SERVER)){
    console.log("Missing server files ")
    return;
}

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

async function StartServer() {
    console.log("📥 Booting servers...")
    const SQLConnect = `node "${SQL_CONNECT}"`;
    const ExpressServer = `node "${EXPRESS_SERVER}"`;
    
    try{
        await runComand(SQLConnect);
        console.log("✅ SQL connected!")

        await runComand(ExpressServer);
        console.log("✅ Express server started!");
    }catch(err){
        console.log("❌ Error starting servers ", err);
    }
}

async function cleanups() {
    //sudo yt-dlp --update
    console.log("📥 Updating yt-dlp")
    const UpdateYTdlp = "sudo yt-dlp --update"
    try{
        await runComand(UpdateYTdlp);

    }catch(err){

    }
}

async function main() {
    await cleanups();
}

main();