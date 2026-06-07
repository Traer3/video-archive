const { runCommand } = require("../services/toolsService");



exports.creatFolders = async (location) => {
    try{
        await creatFolder(location.server,"videos");
        await creatFolder(location.server,"thumbnails");
        await runCommand(`mkdir ${location.server}/${'duplicates'}`)
        return true;
    }catch(err){
        return null;
    }
}

async function creatFolder(location,folderName) {
    const command = ` mkdir ${location}/${folderName} && mkdir ${location}/${folderName}/${folderName}1`
    await runCommand(command);
}