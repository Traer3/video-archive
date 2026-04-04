const fsPromises = require("fs").promises
const {spawn} = require("child_process");

exports.runScript = (scriptPath, args) => {
    return new Promise((resolve, reject)=>{
        const proc = spawn('node',[scriptPath, ...args],{shell: true});
        let output = '';
        proc.stdout.on('data',data => output += data.toString());
        proc.on('close',() => resolve(output));
        proc.on('error', reject);
    });
};

// runComand , getData , exists , writeInfo , FolderReader ,