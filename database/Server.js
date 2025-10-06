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

app.post('/saveVidDuration',(req,res)=>{
    const {vidId, vidDurationData} = req.body;
    const vidDuration = JSON.stringify(vidDurationData)
        db('Vids') // это точно передаст в таблицу ? 
            .where ({id: vidId})
            .update({duration : vidDuration}) // duration в БД integer , а передаю как строку ) 
            .then(()=> res.status(200).json({message: 'Video duration save successfuly'}))
            .catch((err)=> res.status(500).json({message: err.message}))
})

app.listen(3001, ()=>{
    console.log("✅ API initiated")
});




