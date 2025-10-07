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
        console.log("Попытка взять данные ")
        const result = await pool.query("SELECT * FROM videos");
        console.log("Результат ")
        console.log(result)
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
   
})

app.listen(3001, ()=>{
    console.log("✅ API initiated")
});




