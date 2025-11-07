const express = require("express");
const fs = require("fs");
const path = require("path");
const {exec} = require("child_process");

const app = express();
//const VIDEO_DIR = "/home/dbvidsserver/VideoArchive/videos";
//const THUMBNAILS_DIR = "/home/dbvidsserver/VideoArchive/thumbnails";
const VIDEO_DIR = path.join(__dirname, "videos");
const THUMBNAILS_DIR = path.join(__dirname, "./thumbnails");
const AUTHNIFICATION = path.join(__dirname,"LinksGenerator","Authorize.js")

app.use(express.json());

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
}

async function Authentication(comand) {
    try{
        const output = await runComand(comand);
        console.log("Comand executed")
        return output;
    }catch(err){
        console.log("❌ error while processing comand")
        throw err;
    }
}


app.get("/authorize", async (req,res)=>{
    const comand1 = `node "${AUTHNIFICATION}"`
    try{
        const output = await Authentication(comand1);
        res.status(200).send(`✅ Authorization script executed\n${output}`);
    }catch(err){
        res.status(500).send(`❌ Error executing script: ${err.message}`)
    }
})

app.get("/videos",(req, res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    fs.readdir(VIDEO_DIR, (err, files)=>{
        if(err){
            return res.status(500).json({error: "Cannot read video directory"});
        }
        const videoFiles = files
            .filter(f => f.match(/\.(mp4|mov|mkv|webm|avi)$/i))
            .sort((a,b)=> fs.statSync(path.join(VIDEO_DIR,b)).mtime - fs.statSync(path.join(VIDEO_DIR, a)).mtime);
            
       
        const paginatedFiles = videoFiles.slice(startIndex, endIndex);
        
        const thumbnails = fs.readdirSync(THUMBNAILS_DIR);

        const videoList = paginatedFiles.map((file)=>{
            const thumbnailName = file.replace(/\.mp4$/i, '.jpg');
            const hasThumbnail = thumbnails.includes(thumbnailName);
            return{
                name: file,
                url: `http://192.168.0.8:3004/${file}`,
                thumbnail: hasThumbnail
                    ?  `http://192.168.0.8:3004/thumbnails/${thumbnailName}`
                    : null,
            };
        });
    

        res.json({
            page,
            total: videoFiles.length,
            hasNext: endIndex < videoFiles.length,
            videos: videoList
        });
    });
});



app.get("/check/:filename",(req,res)=>{
    const filePath = path.join(VIDEO_DIR, req.params.filename);
    fs.access(filePath, fs.constants.F_OK,(err)=>{
        res.json({exists: !err});
    });
});

app.use("/thumbnails",express.static(THUMBNAILS_DIR,{
    fallthrough: false,
    maxAge: "1d",
}))

app.use(express.static(VIDEO_DIR,{
    fallthrough:false,
    maxAge: "1d"
}));





app.listen(3004, ()=> console.log("✅ Video server running on port 3004"))