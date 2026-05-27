const fsPromises = require("fs").promises
const { spawn, exec } = require("child_process");
const path = require('path');

exports.runScript = (scriptPath, args) => {
    return new Promise((resolve, reject) => {
        const proc = spawn('node', [scriptPath, ...args], { shell: true });
        let output = '';
        proc.stdout.on('data', data => output += data.toString());
        proc.on('close', () => resolve(output));
        proc.on('error', reject);
    });
};

exports.runCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            const info = {
                answer: true,
                stdout: stdout,
                stderr: stderr,
                error: ''
            }
            if (error) {
                reject({...info, answer: false, error: error});
            } else {
                resolve({...info,stdout : stdout, stderr: stderr});
            }
        });
    });
};

exports.writeInfo = async (filePath, data) => {
    try {
        return await fsPromises.writeFile(filePath, data, 'utf-8');
    } catch (err) {
        return console.error(`❌Error writing: ${err.message}`)
    }
};

exports.readMyFile = async (filePath) => {
    try {
        return await fsPromises.readFile(filePath, 'utf-8');
    } catch (err) {
        console.error(`❌Error reading file ${filePath} `, err.message)
        return null;
    }
}

exports.exists = async (path) => {
    try {
        await fsPromises.access(path);
        return true;
    } catch (err) {
        console.log(`❌ Cant access file : ${path}\n${err.message}`)
        return false;
    }
};

exports.sleep = (ms) => {
    return new Promise(
        resolve =>
            setTimeout(resolve, ms)
    );
};

exports.deleteFile = async (filePath) => {
    try {
        await fsPromises.rm(filePath, { recursive: true })
        return true;
    } catch (err) {
        console.log(`❌ Error deleting file : ${filePath}\n${err}`)
    }
};

exports.cleanName = (str) => {
    if (!str) return "";
    return str
        .normalize('NFD')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    /* ебал того рот этих пробелов 
        .toLowerCase()
        .replace(/[\uFF1A]/g, ':')
        .replace(/[\uFF5C]/g, '|')
        .replace(/[\u2215\u29F8\u2044\u27CB\u27CD]/g, '/')
        .replace(/[\uFF1F]/g, '?')
        .replace(/[【「]/g, '[')
        .replace(/[】」]/g, ']')
        .replace(/[\s\u00A0\u2000-\u200B\u202F\u205F\u3000]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    */
};

exports.deleteExtension = (str) =>{
    if(!str) return "";
    /*
    const ext = path.extname(str);
    return path.basename(str,ext);
    */
   const extensionPool = ['.mp4', '.jpg'];
   const hasExtension = extensionPool.some(ext => str.toLowerCase().endsWith(ext))
   if(hasExtension){
    return str.replace(/(\.mp4|\.jpg)$/i, '');
   };
   return str;
};

exports.replaceExtension = (str, newFormat) => {
    if(!str) return "";
    return str
        .replace(/\.mp4$/i, `${newFormat}`)
};

exports.addExtension = (str, newExtension) => {
    if(!str) return "";
    return `${str}${newExtension}`
};

exports.checkHours = (hours, lastCheck, silent = false) => {
    if(!lastCheck){
        console.log("Need time in timestamptz");
        return null;
    }

    const now = new Date();
    const diffMs = now.getTime() - lastCheck.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if(!silent){
        console.log(`Current file lifespan:  ${diffHours.toFixed(1)}`)
    }
    
    if (diffHours >= hours) {
        if(!silent){
            console.log(`🕘 More than ${hours} hours have passed,  it's time to check  `);
        }
        return true;
    } else {
        if(!silent){
            console.log(`It's still early! It's only been ${diffHours.toFixed(1)} hours.`);
        }
        return false;
    }
}
