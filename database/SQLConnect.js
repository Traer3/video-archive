//only for tests 
const express = require("express");
const {Pool} = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "Vids",
    password: "Wedfvb01",
    port: 5432,
});

async function logWriter (type, message) {
    try{
        await pool.query(
            `INSERT INTO logs (log_type, log)
             VALUES ($1, $2)`,
             [type, message]
        );
        console.log(`Log saved: [${type}] ${message}`)
    }catch(err){
        console.error("❌ Database logging failed: ",err.message);
    }
 };

 app.use(express.json());

app.use((req, res, next)=>{
    const oldJson = res.json;

    res.json = function (data){
        if(req.url !== '/addLog' && req.url !== '/logs'){
            logWriter("SQLLogs",`Path: ${req.url} | Status: ${res.statusCode}`);
        }
        return oldJson.call(this, data);
    };

    next();
});

app.get("/videos", async(req, res) => {
    try{
        //console.log("Попытка взять данные ")
        const result = await pool.query("SELECT * FROM videos");
        //console.log("Результат ")
        //console.log(result)
       res.json(result.rows);
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Table videos error",err});
    }
});



app.post('/saveUniqueData',async(req,res)=>{
    try{
        const {vidId, isisunique} = req.body;
        if(!vidId){
            return res.status(400).json({message: "Missing video ID"});
        }

        const result = await pool.query(
            'UPDATE videos SET isitunique = $1 WHERE id = $2 RETURNING *',
            [isisunique, vidId]
        );

        if(result.rowCount === 0){
            return  res.status(404).json({message: "Video not found"});
        }

        res.status(200).json({
            message: '✅ Video is unique',
            updatedVideo: result.rows[0]
        });
    }catch(err){
        console.error("Error saving isisunique data", err);
        res.status(500).json({message: 'Server error', error: err.message})
    }
})

app.post('/saveVidDuration', async(req,res)=>{
    try{
        const {vidId, vidDurationData} = req.body;

        if(!vidId || !vidDurationData){
            return res.status(400).json({message: "Missing video ID or duration"});
        }

        const result = await pool.query(
            'UPDATE videos SET duration = $1 WHERE id = $2 RETURNING *',
            [vidDurationData, vidId]
        );

        if(result.rowCount === 0){
            return res.status(404).json({message: "Video not found"});
        }

        res.status(200).json({
            message:  '✅ Video duration saved successfully',
            updatedVideo: result.rows[0]
        });

    }catch(e){
        console.error('❌ Error saving duration: ', e);
        res.status(500).json({message: 'Server error', error: e.message})
    }
   
});


app.post('/importVideo',async(req,res)=>{
    try{
        const {name, url, duration, sizeMB,category} = req.body;
        //console.log("Name: ",name , " Url: ", url, " Duration: ", duration , " Size: ", sizeMB , " Category: ", category)
        if(!name || !url) {
            return res.status(400).json({message: "Missing video name & url"});
        };

        await pool.query(
            `INSERT INTO videos (name, url, duration, size_mb, category, thumbnail)
             VALUES ($1, $2, $3, $4, $5, $6)`,
             [
                name,
                url,
                duration,
                sizeMB, 
                category,
                'default-thumbnail.jpg'
             ]        
        );

        res.status(200).json({
            message:  '✅ Video imported successfully',
        })
    }catch(err){
        console.error('❌ Error importing video: ', err);
        res.status(500).json({message: 'Server cant import vid', error: err.message})
    }
});

app.post('/deleteVideo',async(req,res)=>{
    try{
        const {videoId} = req.body;
        if(!videoId) {
            return(res.status(400).json({message: "Missing video id  for deletion"}));
        }

        const result = await pool.query(
            `DELETE FROM videos WHERE id = $1`,
            [videoId]
        );

        if(result.rowCount > 0){
            console.log(`Video with id ${videoId} deleted successfully`);
        }else{
            console.log(`Video with id ${videoId} not found`);
        }
    }catch(err){
        console.error('Error wihle deleting video:',err.message);
    }
});


app.get("/logs",async(req,res)=>{
    try{
        const result = await pool.query("SELECT * FROM logs");
        res.json(result.rows);
    }catch(err){
        console.error(err);
        res.status(500).json({error:"Table logs error",err})
    }
});

app.post('/addLog',async(req,res)=>{
    try{
        const {type, message} = req.body;

        const allowedLogs = [
            "SQLLogs","ExpressLogs","DownloaderLogs","ImporterLogs","EraserLogs","IsItUniqueLogs","ThumbnailGeneratorLogs"
        ];

        if(!type || !allowedLogs.includes(type)){
            return(res.status(400).json({message: "Invalid or Missing type of logs"}));
        }

        await pool.query(
            `INSERT INTO logs (log_type, log)
             VALUES ($1, $2)`,
             [type, message]
        );
        res.status(200).json({
            message:  '✅ Logged successfully',
        })
    }catch(err){
        console.error("Error while writing log ",err);
        res.status(500).json({error:"Error table logs ", err })
    }
});





app.listen(3001, ()=>{
    console.log("✅ API initiated")
});




