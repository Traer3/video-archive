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

app.use(express.json());

app.get("/videos", async(req, res) => {
    try{
        //console.log("Попытка взять данные ")
        const result = await pool.query("SELECT * FROM videos");
        //console.log("Результат ")
        //console.log(result)
        res.json(result.rows);
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Server error XD"});
    }
});

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
            return(res.status(400).json({message: "Missing video id for deletion"}));
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
})

app.listen(3001, ()=>{
    console.log("✅ API initiated")
});




