const express = require("express");
const fs = require("fs");
const path = require("path");
const {spawn} = require("child_process");
const app = express();
//const VIDEO_DIR = "/home/dbvidsserver/VideoArchive/videos";
//const THUMBNAILS_DIR = "/home/dbvidsserver/VideoArchive/thumbnails";
const VIDEO_DIR = path.join(__dirname, "videos");
const THUMBNAILS_DIR = path.join(__dirname, "./thumbnails");
const AUTHNIFICATION = path.join(__dirname,"LinksGenerator","Authorize.js")

app.use(express.json());

function runComand(comand, args=[]){
    return new Promise((resolve, reject)=>{
        const proc = spawn(comand, args, {shell: true});

        proc.stdout.on('data',data => {
            console.log(`[stdout] ${data}`);
        });

        proc.stderr.on('data', data=>{
            console.error(`[stderr] ${data}`);
        });

        proc.on('close', code =>{
            console.log(`Process exited with code ${code}`);
            resolve(code);
        })

        proc.on('error', reject);
    });
}


app.get("/authorize", async (req,res)=>{
    try{
        //await runComand('node', [AUTHNIFICATION, 'authorize']);
        //res.send(`✅ Authorization script executed`);
        const proc = spawn('node',[AUTHNIFICATION, 'getUrl'],{shell: true});

        let output = '';
        proc.stdout.on('data',data=>{
            output += data.toString();
        });

        proc.on('close',code => {
            const urlMatch = output.match(/https?:\/\/[^\s]+/);
            if(urlMatch){
                res.json({url: urlMatch[0]});
            }else{
                res.status(500).json({error: 'URL not received', raw: output});
            }
        });

        proc.on('error',err=>{
            res.status(500).json({error: err.message});
        });
    }catch(err){
        res.status(500).send(`❌ Error executing script: ${err.message}`)
    }
});

app.get("/authorize/callback",async(req,res)=>{
    const {code} = req.body;
    //console.log(code)
    if(!code) return res.status(400).json({error: 'Code is required'});

    const proc = spawn('node', [AUTHNIFICATION, 'finish',code],{shell:true});
    let output = '';

    proc.stdout.on('data',data => output += data.toString());
    proc.stderr.on('data',data => console.error(data.toString()));

    proc.on('close',code => {
        res.json({message: 'Authorization completed', output});
    });
});



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