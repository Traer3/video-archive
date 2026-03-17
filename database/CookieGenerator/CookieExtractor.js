const { exec, spawn } = require("child_process");
const fsPromises = require("fs").promises;
const path  = require("path");

const config = require("../config");

const GUILTY_URL_PATH = path.join(__dirname,'GuiltyURL.txt');
const COOKIES_SQLITE_PATH = path.join(__dirname,'cookies.sqlite');
const COOKIES_TXT_PATH = path.join(__dirname,'youtubeCookies.txt');

const exists = async (path) =>{
    try{
        await fsPromises.access(path);
        return true;
    }catch{
        return false;
    }
};

function runComand(comand){
    return new Promise((resolve, reject)=>{
        exec(comand,(error, stdout, stderr)=>{
            if(error){
                reject(error);
            }else{
                resolve(stdout || stderr);
            }
        });
    });
};

async function readMyFile(filePath) {
    try{
        const content = await fsPromises.readFile(filePath,'utf-8');
        return content
    }catch(err){
        console.error(`❌Error reading file ${filePath} `,err.message)
        return null;
    }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const BrowserStarter = async (url) => {
    console.log(`Starting browser using url: ${url}`);
    try{
        const process = spawn("firefox",[url],{
            stdio: 'ignore',
            detached: true,
            shell:false
        });
        process.unref();
    }catch(err){
        console.log(`❌ error while processing ${url} :`,err.message);
    }
};

const BrowserKiller = async () =>{
    console.log("⏳ Waiting for cookie to generate ...")
    await sleep(15000);
    console.log("Closing browser...")
    const killBrowser = `pkill firefox`
    await runComand(killBrowser);
};

const CookieSearcher = async () => {
    console.log("Searching for cookie file");
    const findCookie = `find ~/snap/firefox/common/.mozilla/firefox/ -name "cookies.sqlite"`
    let CookiePath = await runComand(findCookie)
    CookiePath = CookiePath.trim();
    console.log(`Cookie path: ${CookiePath}`)

    if(CookiePath){
        console.log("Copying cookies.sqlite");
        const CopyCookies = `cp "${CookiePath}" "./cookies.sqlite"`;
        await runComand(CopyCookies);
    }
};

const CookieExtractor = async () =>{
    const COOKIES_LITE = path.join(__dirname, "cookies.sqlite")
    if(!(await exists(COOKIES_LITE))){
        console.error("Missing cookies.sqlite");
        return
    }
    try{
        console.log(`Creating youtubeCookies.txt`);
        const headers = '# Netscape HTTP Cookie File\n';
        await fsPromises.writeFile(COOKIES_TXT_PATH,headers);

        console.log("Extracting cookies from cookies.sqlite");
        const ExtractingCookies = `sqlite3 -separator $'\\t' "${COOKIES_LITE}" "SELECT host, 'TRUE', path, CASE WHEN isSecure THEN 'TRUE' ELSE 'FALSE' END, expiry, name, value FROM moz_cookies WHERE host LIKE '%youtube.com%';" >> "${COOKIES_TXT_PATH}"`;
        await runComand(ExtractingCookies);
        console.log("✅ YouTube cookie extracted!")
    }catch(err){
        console.log("Error in CookieExtractor : ",err)
    }
}

const DeleteOldCookies = async(filePath) =>{
    console.log("Deleting old cookies...");
    await fsPromises.rm(filePath,{recursive:true})
}

async function main() {
    if(!(await exists(GUILTY_URL_PATH))){
        console.error("Missing url for cookie extraction");
        return
    }


    await DeleteOldCookies(COOKIES_SQLITE_PATH);
    await DeleteOldCookies(COOKIES_TXT_PATH);

    const urlForExtraction = await readMyFile(GUILTY_URL_PATH);
    if(!urlForExtraction) return;

    await BrowserStarter(urlForExtraction);

    await BrowserKiller();
    
    await CookieSearcher();

    await CookieExtractor()

}

main();