const express = require("express");
const fs = require("fs");
const fsPromises = require("fs").promises
const path = require("path");
const {spawn} = require("child_process");
const app = express(); 

const config = require('./config')

const THUMBNAILS_DIR = path.join(__dirname, "./thumbnails");
const AUTHNIFICATION = path.join(__dirname,"LinksGenerator","Authorize.js");
const VIDEO_ERASER = path.join(__dirname,"VideoEraser.js"); 

const VIDEOS_DIR = path.join(__dirname, "videos");

async function FolderReader() {
    
    const videos = [];
    try{
        
        const subFolders = await fsPromises.readdir(VIDEOS_DIR);
        for(const folderName of subFolders){
            const fullPath = path.join(VIDEOS_DIR,folderName);
            const stats = await fsPromises.stat(fullPath);

            if(stats.isDirectory()){
                console.log(`--- Reading folder: ${folderName} ---`);
                const videoFiles = await fsPromises.readdir(fullPath);
                videoFiles.map(file => {
                    videos.push({
                        name: file,
                        fullPath:path.join(fullPath, file)
                    });
                });
            }
        }
        return videos;
    }catch(err){
        console.error("Error reading directories: ",err.message);
        return [];
    }; 
}

async function logWriter (type, message) {

    const res = await fetch(`${config.VIDEO_URL}/addLog`,{
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

app.get("/:videoName",async(req,res,next)=>{
    const {videoName} = req.params;
    if(!videoName.match(/\.(mp4|mov|mkv|webm|avi)$/i)){
        return next();
    }

    try{
        const allVideos = await FolderReader();
        const videoFile = allVideos.find(v => v.name === videoName);
        if(videoFile){
            res.sendFile(videoFile.fullPath,{
                maxAge: "1d",
                lastModified: true
            });
        }else{
            res.status(404).send("Video not found in any subfolder");
        }
    }catch(err){
        res.status(500).send("Error searching video");
    }
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


app.get("/videos",async (req, res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const allVideos =  await FolderReader();

        if(allVideos.length === 0){
            return res.status(200).json({videos:[],total:0});
        }

        const fileteredFiles = allVideos.filter(v => v.name.match(/\.(mp4|mov|mkv|webm|avi)$/i));
        const filesWithStats = await Promise.all(
            fileteredFiles.map(async (file)=>{
                try{
                    const stats = await fsPromises.stat(file.fullPath);
                    return {...file, mtime: stats.mtime};
                }catch(err){
                    return {...file, mtime: 0};
                }
            })
        );

        const sortedFiles = filesWithStats.sort((a,b)=> b.mtime - a.mtime);
                
        const paginatedFiles = sortedFiles.slice(startIndex, endIndex);
        
        const thumbnails = await fsPromises.readdir(THUMBNAILS_DIR);

        const videoList = paginatedFiles.map((v)=>{
            const file = v.name;
            const thumbnailName = file.replace(/\.mp4$/i, '.jpg');
            const hasThumbnail = thumbnails.includes(thumbnailName);
            return{
                name: file,
                url: `${config.VIDEO_URL}/${encodeURIComponent(file)}`,
                thumbnail: hasThumbnail
                    ?  `${config.VIDEO_URL}/thumbnails/${encodeURIComponent(thumbnailName)}`
                    : null,
            };
        });
    

        res.json({
            page,
            total: sortedFiles.length,
            hasNext: endIndex < sortedFiles.length,
            videos: videoList
        });


});

//применить 
app.get("/check/:filename", async (req,res)=>{
    const {filename} = req.params;
    const allVideos = await FolderReader();
    const exists = allVideos.some(v => v.name === filename);
    res.json({exists});
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


app.listen(3004, ()=> console.log("✅ Video server running on port 3004"))


/*
//old
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
*/