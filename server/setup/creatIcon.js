const { runCommand, writeInfo } = require("../services/toolsService");


exports.creatIcon = async () => {
    const getLocation = `pwd`
    const location = await runCommand(getLocation)
    const cleanLocation = location.stdout.trim();

    const desktopLocation = cleanLocation.replace(/^(\/home\/[^/]+).*/, '$1/Desktop')

    const iconName = 'server.desktop'
    const iconLocation = desktopLocation + "/" + iconName

    const res = await creatIcon(cleanLocation, iconLocation);
    if (!res) {
        return res
    } else { console.log('✅ Icon created!'); }

    const answer = await makeExecutable(iconLocation);
    if (answer) {
        console.log("✅Icon is executable")
    }
    return answer;
};

async function creatIcon(cleanLocation, iconLocation) {
    const serverPath = cleanLocation.replace("/setup","/")
    const scriptData = `
    [Desktop Entry]
    Type=Application
    Terminal=true
    Name=Video Archive Server
    Icon=utilities-terminal
    Exec=bash -i -c "cd ${serverPath} && node server.js; exec bash"
    `
    const res = await writeInfo(iconLocation, scriptData)
    if (res === null) {
        return false
    }
    return true
};

async function makeExecutable(iconLocation) {
    const command1 = `chmod +x ${iconLocation}`
    const res1 = await runCommand(command1);
    const command2 = `gio set ${iconLocation} metadata::trusted true `
    const res2 = await runCommand(command2);
    if (res1.answer && res2.answer) {
        return true;
    }
    return false;
}