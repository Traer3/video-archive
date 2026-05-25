const { creatIcon } = require("./creatIcon");

async function Setup() {
    const icon = await creatIcon();
    console.log("creatIcon : ", icon);
    return;
};


Setup();