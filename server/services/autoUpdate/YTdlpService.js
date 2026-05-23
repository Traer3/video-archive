const { getLogs, addLog } = require("../logService")
const { runCommand, check24Hours, checkHours } = require("../toolsService")

const updateCommand = `yt-dlp -U`

exports.updateYTdlp = async () => {
    try {
        const logs = await getLogs();
        const YTlogs = [...logs.filter(log => log.log_type === 'UpdateYTdlp')].reverse();

        const latestFailedUpdate =  await failedCheck(YTlogs); 
        if(!latestFailedUpdate) return;

        if (!YTlogs || YTlogs.length === 0) {
            await update(updateCommand);
            return;
        };

        const latestUpdateTime = await latestUpdate(YTlogs);
        checkHours
        const answer = checkHours(24,latestUpdateTime)
        if(answer){
            await update();
            return true;
        }
        return false;
    } catch (err) {
        console.error(`❌ Error in updateYTdlp: ${err}`);
        return null;
    }
};

async function update() {
    const res = await runCommand(updateCommand);
    if (res) {
        console.log(`✅ Updated!\n${res.stdout}`)
        await addLog({ type: "UpdateYTdlp", message: 'updated' });
    } else {
        console.log(`❌ Update failed ${res.error}`)
        await addLog({ type: "UpdateYTdlp", message: 'failed' });
    }
};

async function latestUpdate(YTlogs) {
    const updatedLogs = YTlogs.filter(log => log.log === 'updated');
    if (!updatedLogs || updatedLogs.length === 0) {
        await update();
        return;
    }
    const updateTime = updatedLogs[0].created_at
    return updateTime;
};

async function failedCheck(YTlogs) {
    const failedLogs = YTlogs.filter(log => log.log === 'failed');
    if (!failedLogs || failedLogs.length === 0) {
        return true;
    } else {
        const latestFailedUpdate = failedLogs[0].created_at;
        const answer = checkHours(24,latestFailedUpdate, true);
        return !answer;
    }
};
