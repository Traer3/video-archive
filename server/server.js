const app = require('./app.js');
const config = require('./config.js')

const PORT = config.SERVER_PORT;
const IP = config.SERVER_URL;
app.listen(PORT, () => {
    console.log(`\n🚀 Server address  ${IP}\n`)
});