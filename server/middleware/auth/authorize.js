const readline = require('readline')
const { loadCredentials, getAuthUrl, finishAuth } = require("../../services/authorizationService");
const { getQRCode } = require('./generateQRCode');

exports.consoleAuthorization = async () => {
    console.log("📥 Authorization via console... ");
    const existing = await loadCredentials()
    if (existing.status) {
        return existing
    } else {
        try {
            const authUrl = await getAuthUrl();
            if(!authUrl) return null;
            console.log(` \nPlease visit: ${authUrl}\n `);
            await getQRCode();

            const readL = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            const code = await new Promise((resolve) => {
                readL.question('Enter FULL URL from that page here: ', (answer) => {
                    readL.close();
                    try {
                        const parsed = new URL(answer);
                        const codeParam = parsed.searchParams.get("code");
                        if (!codeParam) {
                            console.log("Code parameter not found");
                            return;
                        }
                        resolve(codeParam.trim());

                    } catch (err) {
                        console.log("Error parsing URL", err)
                    };
                });
            });
            const answer = await finishAuth(code);
            if(answer){
                const existing = await loadCredentials()
                return existing
            }
        } catch (err) {
            console.log(`Error in consoleAuthorization : ${err}`)
            return null;
        };
    }
};
