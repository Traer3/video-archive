const pool = require('../config/db.js');

exports.writeVideoForDownload = async (data) =>{
    const {videoName,videoUrl} = data;
    const query = 
        `INSERT INTO videoForDownload (video_name,video_url)
        VALUES ($1, $2) RETURNING *`
    const values = [videoName,videoUrl]
    const result = await pool.query(query,values);
    return result.rows[0];
};

exports.deleteVideoForDownload = async ()=>{
    const query = "TRUNCATE TABLE videofordownload RESTART IDENTITY"
    await pool.query(query);
}

exports.getVideoForDownload = async () =>{
    const result = await pool.query("SELECT * FROM videoForDownload ORDER BY id DESC");
    return  result.rows;
};


