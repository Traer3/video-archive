const { getLogs, addLog } = require("../logService")
const { runCommand } = require("../toolsService")

//Читаем табилцу logs и собираем даные с типом UpdateYTdlp 


//Берем время для проверки , время бери из статуса createdAT
//Ореентр это 
//runCommand()
//Сервер будет запускать команду yt-dlp -U 
const updateCommand = `yt-dlp -U`

exports.updateYTdlp = async () => {
    try {

        const logs = await getLogs();
        const YTlogs = [...logs.filter(log => log.log_type === 'UpdateYTdlp')].reverse();

        if (!YTlogs || YTlogs.length === 0) {
            await firstUpdate(updateCommand);
            return;
        };
        //Создать условие failedCheck , если у меня нету логов с updated , за то есть failed , 
        //роверяем его время , иначе опять получим бан за спам ) 

        const latestUpdateTime = latestUpdate(YTlogs);
        console.log("latestUpdateTime :", latestUpdateTime)


        return;
    } catch (err) {

    }
};

async function firstUpdate() {
    const res = await runCommand(updateCommand);
    if (res) {
        await addLog({ type: "UpdateYTdlp", message: 'updated' });
    } else {
        await addLog({ type: "UpdateYTdlp", message: 'failed' });
    }
};

async function latestUpdate(YTlogs) {
    const updatedLogs = YTlogs.filter(log => log.log === 'updated');
    if (!updatedLogs || updatedLogs.length === 0) {
        await firstUpdate();
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
        const answer = check24Hours(latestFailedUpdate);
        console.log("answer")
        //делаем проверку по времени 
        //если спустя ластовоую попытку прошло 24 часа возвращаем true иначе false 
        return false
    }
};

function check24Hours(lastCheck) {
    const now = new Date();

    const diffMs = now.getTime() - lastCheck.getTime();

    const diffHours = diffMs / (1000 * 60 * 60);
    console.log(`Current file lifespan:  ${diffHours.toFixed(1)}`)
    if (diffHours >= 24) {
        console.log(`🕘 More than 24 hours have passed,  it's time to check  `);
        return true;
    } else {
        console.log(`It's still early! It's only been ${diffHours.toFixed(1)} hours.`);
        return false;
    }
}