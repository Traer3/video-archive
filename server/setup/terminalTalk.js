const readline = require('readline');


exports.terminal = async (question, defaultValue = "") => {
    const readL = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const hint = defaultValue ? `default value is ${defaultValue} ` : ""
    const code = await new Promise((resolve) => {
        readL.question(`${question} ${hint} `, (answer) => {
            readL.close();
            let finalAnswer = answer.trim();
            if (finalAnswer === "" && defaultValue !== "") {
                finalAnswer = defaultValue;
            }
            if (!finalAnswer) {
                console.log("Missing input")
                resolve(null);
            } else {
                resolve(finalAnswer)
            }
        });
    });
    return code;
}