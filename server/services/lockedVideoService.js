const pool = require('../config/db.js');

exports.writeLockedVideos = async (data) =>{
    const {scriptName,type,videoName,videoUrl} = data;
    const query = 
        `INSERT INTO lockedVideos (script_name,type,video_name,video_url)
         VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [scriptName,type,videoName,videoUrl];
    const result = await pool.query(query,values);
    return result.rows[0];
};

exports.getLockedVideos = async () =>{
    const result = await pool.query("SELECT * FROM lockedVideos ORDER BY id DESC");
    return  result.rows;
}

