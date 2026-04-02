const fsPromises = require("fs").promises
const path = require("path");
const {spawn} = require("child_process");
const pool = require('../config/db.js');

exports.readVideoFolders = async (videosDir) => {
    const videos = [];
        try{
            const subFolders = await fsPromises.readdir(videosDir);
            for(const folderName of subFolders){
                const fullPath = path.join(videosDir,folderName);
                const stats = await fsPromises.stat(fullPath);
    
                if(stats.isDirectory()){
                    console.log(`--- Reading folder: ${folderName} ---`);
                    const videoFiles = await fsPromises.readdir(fullPath);
                    videoFiles.map(file => {
                        videos.push({
                            name: file,
                            fullPath:path.join(fullPath, file)
                        });
                    });
                }
            }
            return videos;
        }catch(err){
            console.error("Error reading directories: ",err.message);
            return [];
        }; 
};

exports.runScript = (scriptPath, args) => {
    return new Promise((resolve, reject)=>{
        const proc = spawn('node',[scriptPath, ...args],{shell: true});
        let output = '';
        proc.stdout.on('data',data => output += data.toString());
        proc.on('close',() => resolve(output));
        proc.on('error', reject);
    });
};

exports.saveLog = async (type, message) => {
    await pool.query('INSERT INTO logs (log_type, log) VALUES ($1, $2)',[type, message]);
}