const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const VIDEO_DIR = "/home/dbvidsserver/VideoArchive/videos";

app.use(express.json());

app.use(express.static(VIDEO_DIR,{
    fallthrough:false,
    maxAge: "1d"
}));

app.get("/videos",(req, res)=>{
    fs.readdir(VIDEO_DIR, (err, files)=>{
        if(err){
            return res.status(500).json({error: "Cannot read video directory"});
        }

        const videoFiles = files.filter((f)=>
            f.match(/\.(mp4|mov|mkv|webm|avi)$/i)
        );

        const videoList = videoFiles.map((file)=>({
            name: file,
            url: `http://192.168.0.8:3004/${file}`,
        }));

        res.json(videoList);
    });
});



app.get("/check/:filename",(req,res)=>{
    const filePath = path.join(VIDEO_DIR, req.params.filename);
    fs.access(filePath, fs.constants.F_OK,(err)=>{
        res.json({exists: !err});
    });
});

app.listen(3004, ()=> console.log("✅ Video server running on port 3004"))