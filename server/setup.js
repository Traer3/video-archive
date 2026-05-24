const { runCommand } = require("./services/toolsService");




async function Setup() {
    const getLocation = `pwd`
    const location = await runCommand(getLocation)

    const moveToDesktop = `cd ~/Desktop`
    const res = await runCommand(moveToDesktop);

    
}