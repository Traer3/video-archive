const fsPromises = require("fs").promises
const {spawn, exec} = require("child_process");

exports.runScript = (scriptPath, args) => {
    return new Promise((resolve, reject)=>{
        const proc = spawn('node',[scriptPath, ...args],{shell: true});
        let output = '';
        proc.stdout.on('data',data => output += data.toString());
        proc.on('close',() => resolve(output));
        proc.on('error', reject);
    });
};

exports.runCommand = (command) => {
    return new Promise((resolve, reject)=>{
        exec(command,(error, stdout, stderr)=>{
            if(error){
                reject(error);
            }else{
                resolve(stdout || stderr);
            }
        });
    });
};

exports.writeInfo = async (filePath, data) => {
    try{
        return await fsPromises.writeFile(filePath,data,'utf-8');
    }catch(err){
        return console.error(`❌Error writing: ${err.message}`)
    }
}

exports.exists = async (path) => {
    try{
        await fsPromises.access(path);
        return true;
    }catch(err){
        console.log(`Cant access file : ${path} ${err.message}`)
        return false;
    }
};

exports.sleep = (ms) => {
    return new Promise(
        resolve => 
            setTimeout(resolve, ms)
    );
};


// runComand , getData , exists , writeInfo , FolderReader ,