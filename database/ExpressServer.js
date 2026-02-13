const express = require("express");
const fs = require("fs");
const path = require("path");
const {spawn} = require("child_process");
const app = express();
const VIDEO_DIR = path.join(__dirname, "videos");
const THUMBNAILS_DIR = path.join(__dirname, "./thumbnails");
const AUTHNIFICATION = path.join(__dirname,"LinksGenerator","Authorize.js");
const VIDEO_ERASER = path.join(__dirname,"VideoEraser.js");

async function logWriter (type, message) {

    const res = await fetch('http://192.168.0.8:3001/addLog',{
     method: "POST",
     headers:{"Content-Type":"application/json"},
     body: JSON.stringify({type, message})
    });

    if(!res.ok){
     const errorData = await res.text();
     console.error(`❌ Failed writing log: ${errorData.message}`);
     return;
    }

    const data = await res.json();
    console.log(data);
 };

 app.use(express.json());

const IGNORED_PATHS = ['/videos','/check','/thumbnails'];

app.use((req, res, next)=>{
    const oldJson = res.json;

    res.json = function (data){
        const shouldLog = !IGNORED_PATHS.some(path => req.url.startsWith(path));
        if(shouldLog){
            const logMsg = `[VideoServer] ${req.method} ${req.url} | Status: ${res.statusCode}`;
            logWriter("ExpressLogs",logMsg);
        }
         
        
        return oldJson.call(this, data);
    };

    next();
});




app.get("/tokenCheck",async(req,res)=>{
    try{
        const proc = spawn('node',[AUTHNIFICATION, 'tokenCheck'],{shell: true});
        let output = '';
        proc.stdout.on('data',data=>{
            output += data.toString();
        });

        proc.on('close',check => {
            if(output){
                res.json(output)
            }else{
                res.status(500).json({error: 'Cant proceed with command tokenCheck',raw: output })
            }
        })

        proc.on('error',err=>{
            res.status(500).json({error: err.message});
        });
    }catch(err){
        res.status(500).send(`❌ Error executing script: ${err.message}`)
    }
})

app.get("/authorize", async (req,res)=>{
    try{
        const proc = spawn('node',[AUTHNIFICATION, 'getUrl'],{shell: true});

        let output = '';
        proc.stdout.on('data',data=>{
            output += data.toString();
            
        });

        proc.on('close',code => {
            
            const urlMatch = output.match(/https?:\/\/[^\s]+/);
            console.log(urlMatch)
            if(urlMatch){
                
                res.json({url: urlMatch[0]});
            }else{
                res.status(500).json({error: 'URL not received', raw: output});
            }
        });

        proc.on('error',err=>{
            //отправить если не успешно
            res.status(500).json({error: err.message});
        });
    }catch(err){
        res.status(500).send(`❌ Error executing script: ${err.message}`)
    }
});


app.post("/authorize/callback",async(req,res)=>{
    const {code} = req.body;
    //console.log(code)
    if(!code) return res.status(400).json({error: 'Code is required'});

    const proc = spawn('node', [AUTHNIFICATION, 'finish',code],{shell:true});
    let output = '';

    proc.stdout.on('data',data => output += data.toString());
    proc.stderr.on('data',data => console.error(data.toString()));

    proc.on('close',code => {
        //отправить если успешно 
        res.json({message: 'Authorization completed', output});
    });
});

app.get("/deleteToken",async(req,res)=>{
    try{
        const proc = spawn('node',[AUTHNIFICATION, 'deleteToken'],{shell: true});
        let output = '';
        proc.stdout.on('data',data=>{
            output += data.toString();
        });

        proc.on('close',check => {
            if(output){
                res.json(output)
            }else{
                res.status(500).json({error: 'Cant proceed with command deleteToken',raw: output })
            }
        })

        proc.on('error',err=>{
            res.status(500).json({error: err.message});
        });
    }catch(err){
        res.status(500).send(`❌ Error executing script: ${err.message}`)
    }
})


//переделываем 
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
                url: `http://192.168.0.8:3004/${encodeURIComponent(file)}`,
                thumbnail: hasThumbnail
                    ?  `http://192.168.0.8:3004/thumbnails/${encodeURIComponent(thumbnailName)}`
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

app.post("/deleteVideo",async(req,res)=>{
    const {videos} = req.body;
    if(!videos || !Array.isArray(videos) || videos.length === 0) return res.status(400).json({error: 'No videos for erasing'});

    const proc = spawn('node',[VIDEO_ERASER, 'fullErasing',...videos],{shell:true});
    let output = '';
    
    proc.stdout.on('data',data => output += data.toString());
    proc.stderr.on('data',data => console.error(data.toString()));

    proc.on('close',video => {
        res.json({message: 'Deletion completed',output});
    });

});


app.use(express.static(VIDEO_DIR,{
    fallthrough:false,
    maxAge: "1d"
}));



app.listen(3004, ()=> console.log("✅ Video server running on port 3004"))