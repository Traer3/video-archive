const { runCommand } = require("../services/toolsService");


exports.getPort = async () => {
    const getSQLPort = `grep -Hn "port =" /etc/postgresql/*/*/postgresql.conf`
    const SQLPort = await runCommand(getSQLPort);
    ///etc/postgresql/18/main/postgresql.conf:64:port = 5432\t\t\t\t# (change requires restart)\n
    const logLine = SQLPort.stdout
    const match = logLine.match(/port\s*=\s*([0-9]+)/);
    if(match){
        const port = match[1];
        return  port;
    }else{
        console.log("Cant find port")
        return false
    }
}